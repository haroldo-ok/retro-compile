// ─── In-thread compiler (noWorker mode) ─────────────────────────────────────
// Runs the build pipeline directly on the calling thread — no Web Worker.
// Used for Node.js environments (CLI, testing, SSR).

import type { CompileOptions, CompileResult } from '../types.js';
import { PLATFORM_PROFILES } from '../platforms/profiles.js';
import type { Platform, Language } from '../types.js';
import type { PlatformProfile } from '../platforms/profiles.js';
import { normaliseErrors } from './errors.js';

let _baseUrl = './';

export function configureInThread(baseUrl: string) {
  _baseUrl = baseUrl;
}

// ---------------------------------------------------------------------------
// Engine loading
// ---------------------------------------------------------------------------

interface InThreadEngine {
  store: { reset(): void; putFile(path: string, data: string | Uint8Array): void };
  builder: { handleMessage(msg: unknown): Promise<unknown> };
  PLATFORM_PARAMS: Record<string, unknown>;
  configure?(opts: { baseUrl: string }): void;
  syncFs?(meta: Record<string, unknown>, blob: Record<string, unknown>): void;
}

let _engine: InThreadEngine | null = null;
const _fsMeta: Record<string, unknown> = {};
const _fsBlob: Record<string, unknown> = {};

function getFetch(): typeof fetch {
  if (typeof fetch === 'function') return fetch;
  throw new Error('retro-compile (noWorker): fetch unavailable. Use Node 18+.');
}

async function ensureEngine(): Promise<InThreadEngine> {
  if (_engine) return _engine;
  const f = getFetch();
  const res = await f(`${_baseUrl}vendor/builder-bundle.js`);
  if (!res.ok) throw new Error(`retro-compile: cannot load engine bundle (${res.status})`);
  const code = await res.text();
  try {
    // Use vm.runInThisContext in Node so the bundle has access to globalThis
    const _req = (globalThis as Record<string, unknown>)['require'] as
      ((m: string) => { runInThisContext?: (code: string) => void }) | undefined;
    const vm = _req?.('vm');
    if (vm?.runInThisContext) vm.runInThisContext(code);
    else new Function(code)(); // eslint-disable-line no-new-func
  } catch {
    new Function(code)(); // eslint-disable-line no-new-func
  }
  const eng = (globalThis as Record<string, unknown>)['retroCompileEngine'] as InThreadEngine | undefined;
  if (!eng) throw new Error('retro-compile: builder-bundle.js did not register retroCompileEngine');
  eng.configure?.({ baseUrl: _baseUrl });
  if (Object.keys(_fsMeta).length) eng.syncFs?.(_fsMeta, _fsBlob);
  _engine = eng;
  return eng;
}

async function ensureFilesystem(name: string): Promise<void> {
  if (_fsMeta[name]) return;
  const f = getFetch();
  const [metaRes, dataRes] = await Promise.all([
    f(`${_baseUrl}fs/fs${name}.js.metadata`),
    f(`${_baseUrl}fs/fs${name}.data`),
  ]);
  if (!metaRes.ok) throw new Error(`retro-compile: FS metadata not found for '${name}'`);
  if (!dataRes.ok) throw new Error(`retro-compile: FS data not found for '${name}'`);
  _fsMeta[name] = await metaRes.json();
  _fsBlob[name]  = await dataRes.blob();
  _engine?.syncFs?.(_fsMeta, _fsBlob);
}

// ---------------------------------------------------------------------------
// Build helpers
// ---------------------------------------------------------------------------

function profileToParams(p: PlatformProfile): Record<string, unknown> {
  return {
    arch: p.arch, code_start: p.code_start, codeseg_start: p.codeseg_start,
    rom_start: p.rom_start, rom_size: p.rom_size,
    data_start: p.data_start, data_size: p.data_size, stack_end: p.stack_end,
    extra_link_files: p.extra_link_files, extra_link_args: p.extra_link_args,
    extra_compile_args: p.extra_compile_args, extra_compile_files: p.extra_compile_files,
    extra_preproc_args: p.extra_preproc_args,
    define: p.defines, cfgfile: p.cfgfile, libargs: p.libargs,
  };
}

function firstTool(profile: PlatformProfile, language: Language): string {
  return language === 'asm' ? profile.asmAssembler : profile.cCompiler;
}

// ---------------------------------------------------------------------------
// Public compile function
// ---------------------------------------------------------------------------

export async function compileInThread(opts: CompileOptions): Promise<CompileResult> {
  const platform = opts.platform as Platform;
  const language  = (opts.language ?? 'c') as Language;
  const profile   = PLATFORM_PROFILES[platform];

  if (!profile) {
    return { ok: false, errors: [{ line: 0, message: `Unknown platform: ${platform}`, severity: 'error' }] };
  }
  if (profile.unavailable) {
    return { ok: false, errors: [{ line: 0, message: profile.unavailable, severity: 'error' }] };
  }

  await Promise.all(profile.filesystems.map((f: string) => ensureFilesystem(f)));
  const engine = await ensureEngine();
  engine.PLATFORM_PARAMS[platform] = profileToParams(profile);

  engine.store.reset();
  const mainPath = language === 'c' ? 'main.c' : 'main.asm';
  engine.store.putFile(mainPath, opts.source);
  for (const [name, data] of Object.entries(opts.files ?? {})) {
    engine.store.putFile(name, data);
  }

  const result = await engine.builder.handleMessage({
    updates:    [{ path: mainPath, data: opts.source }],
    buildsteps: [{ platform, tool: firstTool(profile, language), path: mainPath, mainfile: true }],
  }) as Record<string, unknown> | undefined;

  if (!result) return { ok: false, errors: [{ line: 0, message: 'Build returned no result', severity: 'error' }] };

  if ('errors' in result) {
    const raw = result['errors'] as Array<Record<string, unknown>>;
    if (raw?.length) {
      return { ok: false, errors: normaliseErrors(raw.map(e => ({
        line: (e['line'] as number) ?? 0,
        msg: (e['msg'] as string) ?? 'Error',
        path: e['path'] as string | undefined,
      }))) };
    }
  }

  if ('output' in result && result['output']) {
    const symbols  = (result['symbolmap'] as Record<string, number>) ?? {};
    const segments = ((result['segments'] as Array<Record<string, unknown>>) ?? []).map(s => ({
      name: s['name'] as string, start: s['start'] as number, size: s['size'] as number,
      type: (s['type'] === 'rom' || s['type'] === 'ram') ? s['type'] as 'rom'|'ram' : null,
    }));
    let rom = result['output'] as Uint8Array;
    if (profile.gbChecksumPatch) {
      rom = new Uint8Array(rom);
      let cs = 0;
      for (let a = 0x0134; a <= 0x014c; a++) cs = cs - rom[a] - 1;
      rom[0x014d] = cs & 0xff;
    }
    return { ok: true, rom, symbols, segments };
  }

  return { ok: false, errors: [{ line: 0, message: 'Unrecognised build result', severity: 'error' }] };
}
