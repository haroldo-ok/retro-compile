// ─── In-thread compiler (noWorker mode) ─────────────────────────────────────
// Runs the build pipeline directly on the calling thread — no Web Worker.
// Used for Node.js environments (CLI, testing, SSR).
import { PLATFORM_PROFILES } from '../platforms/profiles.js';
import { normaliseErrors } from './errors.js';
let _baseUrl = './';
export function configureInThread(baseUrl) {
    _baseUrl = baseUrl;
}
let _engine = null;
const _fsMeta = {};
const _fsBlob = {};
function getFetch() {
    if (typeof fetch === 'function')
        return fetch;
    throw new Error('retro-compile (noWorker): fetch unavailable. Use Node 18+.');
}
async function ensureEngine() {
    if (_engine)
        return _engine;
    const f = getFetch();
    const res = await f(`${_baseUrl}vendor/builder-bundle.js`);
    if (!res.ok)
        throw new Error(`retro-compile: cannot load engine bundle (${res.status})`);
    const code = await res.text();
    try {
        // Use vm.runInThisContext in Node so the bundle has access to globalThis
        const _req = globalThis['require'];
        const vm = _req?.('vm');
        if (vm?.runInThisContext)
            vm.runInThisContext(code);
        else
            new Function(code)(); // eslint-disable-line no-new-func
    }
    catch {
        new Function(code)(); // eslint-disable-line no-new-func
    }
    const eng = globalThis['retroCompileEngine'];
    if (!eng)
        throw new Error('retro-compile: builder-bundle.js did not register retroCompileEngine');
    eng.configure?.({ baseUrl: _baseUrl });
    if (Object.keys(_fsMeta).length)
        eng.syncFs?.(_fsMeta, _fsBlob);
    _engine = eng;
    return eng;
}
async function ensureFilesystem(name) {
    if (_fsMeta[name])
        return;
    const f = getFetch();
    const [metaRes, dataRes] = await Promise.all([
        f(`${_baseUrl}fs/fs${name}.js.metadata`),
        f(`${_baseUrl}fs/fs${name}.data`),
    ]);
    if (!metaRes.ok)
        throw new Error(`retro-compile: FS metadata not found for '${name}'`);
    if (!dataRes.ok)
        throw new Error(`retro-compile: FS data not found for '${name}'`);
    _fsMeta[name] = await metaRes.json();
    _fsBlob[name] = await dataRes.blob();
    _engine?.syncFs?.(_fsMeta, _fsBlob);
}
// ---------------------------------------------------------------------------
// Build helpers
// ---------------------------------------------------------------------------
function profileToParams(p) {
    return {
        arch: p.arch, code_start: p.code_start,
        rom_start: p.rom_start, rom_size: p.rom_size,
        data_start: p.data_start, data_size: p.data_size, stack_end: p.stack_end,
        extra_link_files: p.extra_link_files, extra_link_args: p.extra_link_args,
        extra_compile_args: p.extra_compile_args, extra_compile_files: p.extra_compile_files,
        extra_preproc_args: p.extra_preproc_args,
        define: p.defines, cfgfile: p.cfgfile, libargs: p.libargs,
    };
}
function firstTool(profile, language) {
    return language === 'asm' ? profile.asmAssembler : profile.cCompiler;
}
// ---------------------------------------------------------------------------
// Public compile function
// ---------------------------------------------------------------------------
export async function compileInThread(opts) {
    const platform = opts.platform;
    const language = (opts.language ?? 'c');
    const profile = PLATFORM_PROFILES[platform];
    if (!profile) {
        return { ok: false, errors: [{ line: 0, message: `Unknown platform: ${platform}`, severity: 'error' }] };
    }
    if (profile.unavailable) {
        return { ok: false, errors: [{ line: 0, message: profile.unavailable, severity: 'error' }] };
    }
    await Promise.all(profile.filesystems.map((f) => ensureFilesystem(f)));
    const engine = await ensureEngine();
    engine.PLATFORM_PARAMS[platform] = profileToParams(profile);
    engine.store.reset();
    const mainPath = language === 'c' ? 'main.c' : 'main.asm';
    engine.store.putFile(mainPath, opts.source);
    for (const [name, data] of Object.entries(opts.files ?? {})) {
        engine.store.putFile(name, data);
    }
    const result = await engine.builder.handleMessage({
        updates: [{ path: mainPath, data: opts.source }],
        buildsteps: [{ platform, tool: firstTool(profile, language), path: mainPath, mainfile: true }],
    });
    if (!result)
        return { ok: false, errors: [{ line: 0, message: 'Build returned no result', severity: 'error' }] };
    if ('errors' in result) {
        const raw = result['errors'];
        if (raw?.length) {
            return { ok: false, errors: normaliseErrors(raw.map(e => ({
                    line: e['line'] ?? 0,
                    msg: e['msg'] ?? 'Error',
                    path: e['path'],
                }))) };
        }
    }
    if ('output' in result && result['output']) {
        const symbols = result['symbolmap'] ?? {};
        const segments = (result['segments'] ?? []).map(s => ({
            name: s['name'], start: s['start'], size: s['size'],
            type: (s['type'] === 'rom' || s['type'] === 'ram') ? s['type'] : null,
        }));
        let rom = result['output'];
        return { ok: true, rom, symbols, segments };
    }
    return { ok: false, errors: [{ line: 0, message: 'Unrecognised build result', severity: 'error' }] };
}
//# sourceMappingURL=in-thread.js.map