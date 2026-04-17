// retro-compile worker bundle — classic worker (no ES module syntax)
// Built by scripts/build-worker.mjs
// Do not edit — regenerate with: node scripts/build-worker.mjs
'use strict';

// ── Inlined: platforms/profiles.js ───────────────────────────────────────────
// ─── Platform profiles ───────────────────────────────────────────────────────
// Each profile describes:
//   • which tool runs first (the "compiler" step)
//   • which filesystem pack(s) to preload
//   • the memory map parameters forwarded to the linker
//   • any extra flags or library files
//
// This is the single source of truth that replaces the scattered
// PLATFORM_PARAMS + TOOL_PRELOADFS combination in 8bitworkshop.
// ---------------------------------------------------------------------------
// Profile registry
// ---------------------------------------------------------------------------
const PLATFORM_PROFILES = {
    // ── ColecoVision ──────────────────────────────────────────────────────────
    coleco: {
        name: 'ColecoVision',
        arch: 'z80',
        cCompiler: 'sdcc',
        asmAssembler: 'sdasz80',
        linker: 'sdldz80',
        filesystems: ['sdcc'],
        rom_start: 0x8000,
        code_start: 0x8100,
        rom_size: 0x8000,
        data_start: 0x7000,
        data_size: 0x400,
        stack_end: 0x8000,
        extra_preproc_args: ['-I', '/share/include/coleco', '-D', 'CV_CV'],
        extra_link_args: [
            '-k', '/share/lib/coleco',
            '-l', 'libcv',
            '-l', 'libcvu',
            'crt0.rel',
        ],
    },
    // ── MSX ───────────────────────────────────────────────────────────────────
    msx: {
        name: 'MSX',
        arch: 'z80',
        cCompiler: 'sdcc',
        asmAssembler: 'sdasz80',
        linker: 'sdldz80',
        filesystems: ['sdcc'],
        rom_start: 0x4000,
        code_start: 0x4000,
        rom_size: 0x8000,
        data_start: 0xc000,
        data_size: 0x3000,
        stack_end: 0xffff,
        extra_link_args: ['crt0-msx.rel'],
        extra_link_files: ['crt0-msx.rel', 'crt0-msx.lst'],
    },
    // ── ZX Spectrum ───────────────────────────────────────────────────────────
    zx: {
        name: 'ZX Spectrum',
        arch: 'z80',
        cCompiler: 'sdcc',
        asmAssembler: 'sdasz80',
        linker: 'sdldz80',
        filesystems: ['sdcc'],
        code_start: 0x5ccb,
        rom_size: 0xff58 - 0x5ccb,
        data_start: 0xf000,
        data_size: 0xfe00 - 0xf000,
        stack_end: 0xff58,
        extra_link_args: ['crt0-zx.rel'],
        extra_link_files: ['crt0-zx.rel', 'crt0-zx.lst'],
    },
    // ── Midway 8080 B&W arcade ────────────────────────────────────────────────
    mw8080bw: {
        name: 'Midway 8080 B&W',
        arch: 'z80',
        cCompiler: 'sdcc',
        asmAssembler: 'sdasz80',
        linker: 'sdldz80',
        filesystems: ['sdcc'],
        code_start: 0x0,
        rom_size: 0x2000,
        data_start: 0x2000,
        data_size: 0x400,
        stack_end: 0x2400,
    },
    // ── Galaxian arcade ───────────────────────────────────────────────────────
    galaxian: {
        name: 'Galaxian arcade',
        arch: 'z80',
        cCompiler: 'sdcc',
        asmAssembler: 'sdasz80',
        linker: 'sdldz80',
        filesystems: ['sdcc'],
        code_start: 0x0,
        rom_size: 0x4000,
        data_start: 0x4000,
        data_size: 0x400,
        stack_end: 0x4800,
    },
    // ── Generic Z80 ───────────────────────────────────────────────────────────
    base_z80: {
        name: 'Generic Z80',
        arch: 'z80',
        cCompiler: 'sdcc',
        asmAssembler: 'sdasz80',
        linker: 'sdldz80',
        filesystems: ['sdcc'],
        code_start: 0x0,
        rom_size: 0x8000,
        data_start: 0x8000,
        data_size: 0x8000,
        stack_end: 0x0,
    },
    // ── NES ───────────────────────────────────────────────────────────────────
    nes: {
        name: 'Nintendo NES',
        arch: '6502',
        cCompiler: 'cc65',
        asmAssembler: 'ca65',
        linker: 'ld65',
        filesystems: ['65-nes'],
        code_start: 0x8000,
        data_start: 0x200,
        defines: ['__NES__'],
        cfgfile: 'neslib2.cfg',
        libargs: [
            'crt0.o', 'nes.lib', 'neslib2.lib',
            '-D', 'NES_MAPPER=0',
            '-D', 'NES_PRG_BANKS=2',
            '-D', 'NES_CHR_BANKS=1',
            '-D', 'NES_MIRRORING=0',
        ],
        extra_link_files: ['crt0.o', 'neslib2.lib', 'neslib2.cfg', 'nesbanked.cfg'],
    },
    // ── Commodore 64 ──────────────────────────────────────────────────────────
    c64: {
        name: 'Commodore 64',
        arch: '6502',
        cCompiler: 'cc65',
        asmAssembler: 'ca65',
        linker: 'ld65',
        filesystems: ['65-c64'],
        code_start: 0x810,
        data_start: 0x200,
        defines: ['__CBM__', '__C64__'],
        cfgfile: 'c64.cfg',
        libargs: ['c64.lib'],
    },
    // ── Atari 2600 VCS ────────────────────────────────────────────────────────
    vcs: {
        name: 'Atari 2600 VCS',
        arch: '6502',
        cCompiler: 'cc65',
        asmAssembler: 'ca65',
        linker: 'ld65',
        filesystems: ['65-sim6502'], // archive ships sim6502 instead of atari2600
        code_start: 0x1000,
        data_start: 0x80,
        data_size: 0x80,
        defines: ['__ATARI2600__'],
        cfgfile: 'atari2600.cfg',
        libargs: ['crt0.o', 'atari2600.lib'],
        extra_link_files: ['crt0.o', 'atari2600.cfg'],
    },
    // ── Apple II ──────────────────────────────────────────────────────────────
    apple2: {
        name: 'Apple II',
        arch: '6502',
        cCompiler: 'cc65',
        asmAssembler: 'ca65',
        linker: 'ld65',
        filesystems: ['65-apple2'],
        code_start: 0x803,
        data_start: 0x200,
        defines: ['__APPLE2__'],
        cfgfile: 'apple2.cfg',
        libargs: ['--lib-path', '/share/target/apple2/drv', 'apple2.lib'],
    },
    // ── Atari 8-bit 800XL ─────────────────────────────────────────────────────
    'atari8-800xl': {
        name: 'Atari 8-bit 800XL',
        arch: '6502',
        cCompiler: 'cc65',
        asmAssembler: 'ca65',
        linker: 'ld65',
        filesystems: ['65-atari8'],
        code_start: 0x2000,
        data_start: 0x200,
        defines: ['__ATARI__'],
        cfgfile: 'atari-cart.cfg',
        libargs: ['atari.lib', '-D', '__CARTFLAGS__=4'],
    },
    // ── Vectrex ───────────────────────────────────────────────────────────────
    vectrex: {
        name: 'GCE Vectrex',
        arch: '6809',
        cCompiler: 'cmoc',
        asmAssembler: 'xasm6809',
        linker: 'lwlink',
        filesystems: [], // no prebuilt fs pack; extra files loaded from lib/
        code_start: 0x0,
        rom_size: 0x8000,
        data_start: 0xc880,
        data_size: 0x380,
        stack_end: 0xcc00,
        extra_compile_files: ['assert.h', 'cmoc.h', 'stdarg.h', 'vectrex.h', 'stdlib.h', 'bios.h'],
        extra_compile_args: ['--vectrex'],
        extra_link_files: ['vectrex.scr', 'libcmoc-crt-vec.a', 'libcmoc-std-vec.a'],
        extra_link_args: ['-svectrex.scr', '-lcmoc-crt-vec', '-lcmoc-std-vec'],
    },
    // ── Williams Z80 arcade ───────────────────────────────────────────────────
    'williams-z80': {
        name: 'Williams arcade (Z80)',
        arch: 'z80',
        cCompiler: 'sdcc',
        asmAssembler: 'sdasz80',
        linker: 'sdldz80',
        filesystems: ['sdcc'],
        code_start: 0x0,
        rom_size: 0x9800,
        data_start: 0x9800,
        data_size: 0x2800,
        stack_end: 0xc000,
    },
};
/** Convenience — look up a profile and throw clearly if it's missing. */
function getProfile(platform) {
    const p = PLATFORM_PROFILES[platform];
    if (!p)
        throw new Error(`retro-compile: unknown platform '${platform}'`);
    return p;
}

// ── Worker logic: worker/worker.js ───────────────────────────────────────────
// ─── Compiler worker ────────────────────────────────────────────────────────
// Runs inside a Web Worker. Receives CompileMessage, drives the 8bitworkshop
// builder pipeline, and posts back a CompileResultMessage.

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
    // Before executing the vendor bundle we must ensure importScripts is
    // explicitly on globalThis. Inside new Function(), `typeof importScripts`
    // looks up the identifier in the global object — not via scope chain — so
    // if it was only inherited from WorkerGlobalScope it may not be found.
    // Emscripten uses ENVIRONMENT_IS_WORKER = typeof importScripts === 'function'
    // to decide whether to initialize WORKERFS with FileReaderSync. If that
    // check fails the WORKERFS reader is never set and blob.slice() crashes.
    if (typeof importScripts === 'function' && !Object.prototype.hasOwnProperty.call(globalThis, 'importScripts')) {
        try {
            Object.defineProperty(globalThis, 'importScripts', { value: importScripts, writable: true, configurable: true });
        }
        catch { }
    }
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
        arch: p.arch, code_start: p.code_start,
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
