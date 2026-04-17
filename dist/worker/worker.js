// ─── Compiler worker ────────────────────────────────────────────────────────
// Runs inside a Web Worker. Receives CompileMessage, drives the 8bitworkshop
// builder pipeline, and posts back a CompileResultMessage.
import { PLATFORM_PROFILES } from '../platforms/profiles.js';
// ---------------------------------------------------------------------------
// Global state
// ---------------------------------------------------------------------------
let _baseUrl = './';
let _vendorUrl = './vendor/';
const _loadedScripts = new Set();
const _wasmBinaries = {};
const _fsMeta = {};
const _fsBlob = {};
// Emscripten shims — `self` and `window` are read-only getters on
// WorkerGlobalScope, so direct assignment throws. Use defineProperty with
// a try/catch so we silently skip any that are non-configurable (they're
// already the right value in a Worker context anyway).
const g = globalThis;
function shimGlobal(key, value) {
    if (g[key] === value)
        return; // already correct
    try {
        Object.defineProperty(globalThis, key, {
            value, writable: true, configurable: true,
        });
    }
    catch {
        // Non-configurable and already the correct value — safe to ignore.
    }
}
shimGlobal('self', globalThis);
shimGlobal('window', globalThis);
if (!g['location'])
    shimGlobal('location', { href: './' });
// ---------------------------------------------------------------------------
// Asset loading
// ---------------------------------------------------------------------------
// Tools that ship only as asm.js (no .wasm companion).
// For these we skip the binary fetch and load only the JS glue.
const ASMJS_ONLY = new Set(['mcpp']);
// Tools that are entirely absent from this build of 8bitworkshop.
// Attempting to compile for a platform that needs one of these will
// produce a clear error from the builder rather than a cryptic fetch failure.
const UNAVAILABLE_TOOLS = new Set([
// xasm6809 — only needed for direct Vectrex ASM, not C via cmoc
]);
async function preloadWasm(name) {
    if (UNAVAILABLE_TOOLS.has(name)) {
        throw new Error(`retro-compile: tool '${name}' is not available in this build. ` +
            `(Game Boy / sdasgb requires a full 8bitworkshop build with Emscripten.)`);
    }
    const jsUrl = `${_baseUrl}wasm/${name}.js`;
    const binUrl = `${_baseUrl}wasm/${name}.wasm`;
    // Load the JS glue (works for both Wasm and asm.js-only tools)
    if (!_loadedScripts.has(jsUrl)) {
        // mcpp ships only as asm.js under asmjs/, not wasm/
        const actualJsUrl = ASMJS_ONLY.has(name)
            ? `${_baseUrl}asmjs/${name}.js`
            : jsUrl;
        const res = await fetch(actualJsUrl);
        if (!res.ok)
            throw new Error(`retro-compile: cannot fetch ${actualJsUrl} (${res.status})`);
        // eslint-disable-next-line no-new-func
        new Function(await res.text())();
        _loadedScripts.add(jsUrl); // key on the canonical jsUrl regardless
    }
    // Skip binary fetch for asm.js-only tools
    if (ASMJS_ONLY.has(name))
        return;
    if (!_wasmBinaries[name]) {
        const res = await fetch(binUrl);
        if (!res.ok)
            throw new Error(`retro-compile: cannot fetch ${binUrl} (${res.status})`);
        const bytes = new Uint8Array(await res.arrayBuffer());
        _wasmBinaries[name] = bytes;
        // Expose where Emscripten's moduleInstFn looks for it
        const blob = g['wasmBlob'];
        if (blob)
            blob[name] = bytes;
        else
            g['wasmBlob'] = { [name]: bytes };
    }
}
async function preloadFilesystem(name) {
    if (_fsMeta[name])
        return;
    const [metaRes, dataRes] = await Promise.all([
        fetch(`${_baseUrl}fs/fs${name}.js.metadata`),
        fetch(`${_baseUrl}fs/fs${name}.data`),
    ]);
    if (!metaRes.ok)
        throw new Error(`retro-compile: FS metadata not found for '${name}'`);
    if (!dataRes.ok)
        throw new Error(`retro-compile: FS data not found for '${name}'`);
    _fsMeta[name] = await metaRes.json();
    _fsBlob[name] = await dataRes.blob();
    // Push into engine if already loaded (compile called after precompile)
    _engine?.configure?.({ baseUrl: _baseUrl });
    _engine?.syncFs?.(_fsMeta, _fsBlob);
}
let _engine = null;
async function getEngine() {
    if (_engine)
        return _engine;
    const bundleUrl = `${_vendorUrl}builder-bundle.js`;
    const res = await fetch(bundleUrl);
    if (!res.ok)
        throw new Error(`retro-compile: cannot load engine from ${bundleUrl} (${res.status})`);
    // eslint-disable-next-line no-new-func
    new Function(await res.text())();
    const eng = globalThis['retroCompileEngine'];
    if (!eng)
        throw new Error('retro-compile: engine bundle did not register retroCompileEngine');
    // Configure PWORKER base URL and install the importScripts/XHR shims
    eng.configure?.({ baseUrl: _baseUrl });
    // Sync any filesystems already preloaded before the engine loaded
    if (Object.keys(_fsMeta).length)
        eng.syncFs?.(_fsMeta, _fsBlob);
    _engine = eng;
    return eng;
}
// ---------------------------------------------------------------------------
// Build helpers
// ---------------------------------------------------------------------------
function requiredModules(profile, language) {
    const mods = [];
    if (language === 'c') {
        mods.push(profile.cCompiler);
        mods.push('mcpp');
    }
    mods.push(profile.asmAssembler);
    mods.push(profile.linker);
    return [...new Set(mods)];
}
function firstTool(profile, language) {
    return language === 'asm' ? profile.asmAssembler : profile.cCompiler;
}
function profileToParams(p) {
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
async function runBuild(msg) {
    const platform = msg.platform;
    const language = msg.language;
    const profile = PLATFORM_PROFILES[platform];
    if (!profile) {
        return { type: 'result', id: msg.id, ok: false,
            errors: [{ line: 0, message: `Unknown platform: ${platform}`, severity: 'error' }] };
    }
    if (profile.unavailable) {
        return { type: 'result', id: msg.id, ok: false,
            errors: [{ line: 0, message: `Platform '${platform}' is unavailable: ${profile.unavailable}`, severity: 'error' }] };
    }
    await Promise.all([
        ...requiredModules(profile, language).map(m => preloadWasm(m)),
        ...profile.filesystems.map((f) => preloadFilesystem(f)),
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
        updates: [{ path: mainPath, data: msg.source }],
        buildsteps: [{ platform, tool: firstTool(profile, language), path: mainPath, mainfile: true }],
    });
    if (!result) {
        return { type: 'result', id: msg.id, ok: false,
            errors: [{ line: 0, message: 'Build returned no result', severity: 'error' }] };
    }
    if ('errors' in result) {
        const rawErrors = result['errors'];
        if (rawErrors?.length) {
            return { type: 'result', id: msg.id, ok: false,
                errors: rawErrors.map(e => ({
                    line: e['line'] ?? 0,
                    path: e['path'],
                    message: e['msg'] ?? 'Error',
                    severity: (e['msg'] ?? '').toLowerCase().includes('warning')
                        ? 'warning' : 'error',
                })) };
        }
    }
    if ('output' in result && result['output']) {
        const symbols = result['symbolmap'] ?? {};
        const rawSegs = result['segments'] ?? [];
        const segments = rawSegs.map(s => ({
            name: s['name'], start: s['start'], size: s['size'],
            type: (s['type'] === 'rom' || s['type'] === 'ram') ? s['type'] : null,
        }));
        const mappings = msg.debug ? [] : undefined;
        if (msg.debug && result['listings']) {
            const listings = result['listings'];
            for (const [_path, listing] of Object.entries(listings)) {
                const lines = (listing['lines'] ?? []);
                for (const ln of lines) {
                    mappings.push({
                        path: ln['path'] ?? _path,
                        line: ln['line'],
                        romOffset: ln['offset'],
                        insns: ln['insns'],
                    });
                }
            }
        }
        let rom = result['output'];
        if (profile.gbChecksumPatch) {
            rom = new Uint8Array(rom);
            let cs = 0;
            for (let a = 0x0134; a <= 0x014c; a++)
                cs = cs - rom[a] - 1;
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
self.postMessage({ type: 'ready' });
self.addEventListener('message', async (evt) => {
    const msg = evt.data;
    if (msg.type === 'reset')
        return;
    if (msg.type === 'preload') {
        _baseUrl = msg.baseUrl;
        _vendorUrl = msg.vendorUrl;
        const profile = PLATFORM_PROFILES[msg.fs];
        const fsNames = profile ? profile.filesystems : [msg.fs];
        for (const name of fsNames) {
            try {
                await preloadFilesystem(name);
            }
            catch (e) {
                console.warn(`[retro-compile] preload '${name}' failed:`, e);
            }
        }
        return;
    }
    if (msg.type === 'compile') {
        _baseUrl = msg.baseUrl;
        _vendorUrl = msg.vendorUrl;
        let out;
        try {
            out = await runBuild(msg);
        }
        catch (e) {
            out = { type: 'result', id: msg.id, ok: false,
                errors: [{ line: 0, message: e instanceof Error ? e.message : String(e), severity: 'error' }] };
        }
        const xfers = [];
        if (out.ok && out.rom)
            xfers.push(out.rom.buffer);
        self.postMessage(out, xfers);
    }
});
//# sourceMappingURL=worker.js.map