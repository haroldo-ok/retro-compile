// ─── Compiler worker ────────────────────────────────────────────────────────
// Runs inside a Web Worker. Receives CompileMessage, drives the 8bitworkshop
// builder pipeline, and posts back a CompileResultMessage.

/// <reference lib="webworker" />

import type { CompileMessage, OutboundMessage, InboundMessage, CompileResultMessage } from '../core/protocol.js';
import { PLATFORM_PROFILES } from '../platforms/profiles.js';
import type { Platform, Language } from '../types.js';
import type { PlatformProfile } from '../platforms/profiles.js';

// ---------------------------------------------------------------------------
// Global state
// ---------------------------------------------------------------------------

let _baseUrl = './';

const _loadedScripts = new Set<string>();
const _wasmBinaries: Record<string, Uint8Array> = {};
const _fsMeta: Record<string, unknown> = {};
const _fsBlob: Record<string, unknown> = {};

// Emscripten shims
const g = globalThis as Record<string, unknown>;
g['self']   = globalThis;
g['window'] = globalThis;
if (!g['location']) g['location'] = { href: './' };

// ---------------------------------------------------------------------------
// Asset loading
// ---------------------------------------------------------------------------

async function preloadWasm(name: string): Promise<void> {
  const jsUrl  = `${_baseUrl}wasm/${name}.js`;
  const binUrl = `${_baseUrl}wasm/${name}.wasm`;

  if (!_loadedScripts.has(jsUrl)) {
    const res = await fetch(jsUrl);
    if (!res.ok) throw new Error(`retro-compile: cannot fetch ${jsUrl} (${res.status})`);
    // Run in global scope like importScripts()
    // eslint-disable-next-line no-new-func
    new Function(await res.text())();
    _loadedScripts.add(jsUrl);
  }

  if (!_wasmBinaries[name]) {
    const res = await fetch(binUrl);
    if (!res.ok) throw new Error(`retro-compile: cannot fetch ${binUrl} (${res.status})`);
    const bytes = new Uint8Array(await res.arrayBuffer());
    _wasmBinaries[name] = bytes;
    // Expose where Emscripten's moduleInstFn looks for it
    const blob = g['wasmBlob'] as Record<string, Uint8Array> | undefined;
    if (blob) blob[name] = bytes;
    else g['wasmBlob'] = { [name]: bytes };
  }
}

async function preloadFilesystem(name: string): Promise<void> {
  if (_fsMeta[name]) return;
  const [metaRes, dataRes] = await Promise.all([
    fetch(`${_baseUrl}fs/fs${name}.js.metadata`),
    fetch(`${_baseUrl}fs/fs${name}.data`),
  ]);
  if (!metaRes.ok) throw new Error(`retro-compile: FS metadata not found for '${name}'`);
  if (!dataRes.ok) throw new Error(`retro-compile: FS data not found for '${name}'`);
  _fsMeta[name] = await metaRes.json();
  _fsBlob[name]  = await dataRes.blob();
  // Push into engine scope if already loaded
  _engine?.syncFs?.(_fsMeta, _fsBlob);
}

// ---------------------------------------------------------------------------
// Build engine (lazy-loaded from vendor bundle)
// ---------------------------------------------------------------------------

interface StoreAPI {
  reset(): void;
  putFile(path: string, data: string | Uint8Array): void;
}

interface BuilderAPI {
  handleMessage(msg: unknown): Promise<unknown>;
}

interface BuildEngine {
  store: StoreAPI;
  builder: BuilderAPI;
  PLATFORM_PARAMS: Record<string, unknown>;
  /** Tell the engine its baseUrl so XHR lib-file fetches are rewritten. */
  configure?(opts: { baseUrl: string }): void;
  /** Sync preloaded FS metadata into the engine's emglobal scope. */
  syncFs?(meta: Record<string, unknown>, blob: Record<string, unknown>): void;
}

let _engine: BuildEngine | null = null;

async function getEngine(): Promise<BuildEngine> {
  if (_engine) return _engine;
  const res = await fetch(`${_baseUrl}vendor/builder-bundle.js`);
  if (!res.ok) throw new Error(`retro-compile: cannot load engine (${res.status})`);
  // eslint-disable-next-line no-new-func
  new Function(await res.text())();
  const eng = (globalThis as Record<string, unknown>)['retroCompileEngine'] as BuildEngine | undefined;
  if (!eng) throw new Error('retro-compile: engine bundle did not register retroCompileEngine');
  // Configure the engine with the current baseUrl so its internal XHR
  // interceptor rewrites lib/ fetches to the correct hosted location.
  eng.configure?.({ baseUrl: _baseUrl });
  // Sync any filesystems already preloaded before the engine loaded.
  if (Object.keys(_fsMeta).length) eng.syncFs?.(_fsMeta, _fsBlob);
  _engine = eng;
  return eng;
}

// ---------------------------------------------------------------------------
// Build helpers
// ---------------------------------------------------------------------------

function requiredModules(profile: PlatformProfile, language: Language): string[] {
  const mods: string[] = [];
  if (language === 'c') { mods.push(profile.cCompiler); mods.push('mcpp'); }
  mods.push(profile.asmAssembler);
  mods.push(profile.linker);
  return [...new Set(mods)];
}

function firstTool(profile: PlatformProfile, language: Language): string {
  return language === 'asm' ? profile.asmAssembler : profile.cCompiler;
}

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

// ---------------------------------------------------------------------------
// Main build function
// ---------------------------------------------------------------------------

async function runBuild(msg: CompileMessage): Promise<CompileResultMessage> {
  const platform = msg.platform as Platform;
  const language = msg.language as Language;
  const profile  = PLATFORM_PROFILES[platform];

  if (!profile) {
    return { type: 'result', id: msg.id, ok: false,
      errors: [{ line: 0, message: `Unknown platform: ${platform}`, severity: 'error' }] };
  }

  await Promise.all([
    ...requiredModules(profile, language).map(m => preloadWasm(m)),
    ...profile.filesystems.map((f: string) => preloadFilesystem(f)),
  ]);

  const engine = await getEngine();
  engine.PLATFORM_PARAMS[platform] = profileToParams(profile);

  engine.store.reset();
  const mainPath = language === 'c' ? 'main.c' : 'main.asm';
  engine.store.putFile(mainPath, msg.source);
  for (const [name, data] of Object.entries(msg.files ?? {})) {
    engine.store.putFile(name, data);
  }

  const result = await engine.builder.handleMessage({
    updates:    [{ path: mainPath, data: msg.source }],
    buildsteps: [{ platform, tool: firstTool(profile, language), path: mainPath, mainfile: true }],
  }) as Record<string, unknown> | undefined;

  if (!result) {
    return { type: 'result', id: msg.id, ok: false,
      errors: [{ line: 0, message: 'Build returned no result', severity: 'error' }] };
  }

  if ('errors' in result) {
    const rawErrors = (result['errors'] as Array<Record<string, unknown>>);
    if (rawErrors?.length) {
      return { type: 'result', id: msg.id, ok: false,
        errors: rawErrors.map(e => ({
          line:     (e['line'] as number) ?? 0,
          path:     e['path'] as string | undefined,
          message:  (e['msg'] as string) ?? 'Error',
          severity: ((e['msg'] as string) ?? '').toLowerCase().includes('warning')
            ? ('warning' as const) : ('error' as const),
        })) };
    }
  }

  if ('output' in result && result['output']) {
    const symbols = (result['symbolmap'] as Record<string, number>) ?? {};
    const rawSegs = (result['segments'] as Array<Record<string, unknown>>) ?? [];
    const segments = rawSegs.map(s => ({
      name: s['name'] as string, start: s['start'] as number, size: s['size'] as number,
      type: (s['type'] === 'rom' || s['type'] === 'ram') ? s['type'] as 'rom'|'ram' : null,
    }));

    const mappings: CompileResultMessage['mappings'] = msg.debug ? [] : undefined;
    if (msg.debug && result['listings']) {
      const listings = result['listings'] as Record<string, Record<string, unknown>>;
      for (const [_path, listing] of Object.entries(listings)) {
        const lines = (listing['lines'] ?? []) as Array<Record<string, unknown>>;
        for (const ln of lines) {
          mappings!.push({
            path:      (ln['path'] as string) ?? _path,
            line:      ln['line'] as number,
            romOffset: ln['offset'] as number,
            insns:     ln['insns'] as string | undefined,
          });
        }
      }
    }

    let rom = result['output'] as Uint8Array;
    if (profile.gbChecksumPatch) {
      rom = new Uint8Array(rom);
      let cs = 0;
      for (let a = 0x0134; a <= 0x014c; a++) cs = cs - rom[a] - 1;
      rom[0x014d] = cs & 0xff;
    }

    return { type: 'result', id: msg.id, ok: true, rom, symbols, segments, mappings };
  }

  return { type: 'result', id: msg.id, ok: false,
    errors: [{ line: 0, message: `Unrecognised result: ${Object.keys(result).join(', ')}`, severity: 'error' }] };
}

// ---------------------------------------------------------------------------
// Message loop
// ---------------------------------------------------------------------------

(self as unknown as Worker).postMessage({ type: 'ready' } satisfies OutboundMessage);

(self as unknown as Worker).addEventListener('message', async (evt: MessageEvent<InboundMessage>) => {
  const msg = evt.data;
  if (msg.type === 'reset') return;

  if (msg.type === 'preload') {
    _baseUrl = msg.baseUrl;
    // msg.fs may be a raw FS name ('sdcc') or a platform ID ('gb').
    // Try it as a platform first, then fall back to treating it as an FS name.
    const profile = PLATFORM_PROFILES[msg.fs as Platform];
    const fsNames: string[] = profile
      ? profile.filesystems
      : [msg.fs];
    for (const name of fsNames) {
      try { await preloadFilesystem(name); } catch (e) {
        console.warn(`[retro-compile] preload '${name}' failed:`, e);
      }
    }
    return;
  }

  if (msg.type === 'compile') {
    _baseUrl = msg.baseUrl;
    let out: CompileResultMessage;
    try {
      out = await runBuild(msg);
    } catch (e: unknown) {
      out = { type: 'result', id: msg.id, ok: false,
        errors: [{ line: 0, message: e instanceof Error ? e.message : String(e), severity: 'error' }] };
    }
    const xfers: Transferable[] = [];
    if (out.ok && out.rom) xfers.push(out.rom.buffer);
    (self as unknown as Worker).postMessage(out, xfers);
  }
});
