// ─── retro-compile public entry point ───────────────────────────────────────
import { WorkerBridge } from './core/bridge.js';
import { compileInThread, configureInThread } from './core/in-thread.js';
let _bridge = null;
let _baseUrl = './';
let _vendorUrl = './vendor/';
let _noWorker = false;
let _initiated = false;
// ---------------------------------------------------------------------------
// init()
// ---------------------------------------------------------------------------
export async function init(opts = {}) {
    if (_initiated)
        return;
    _initiated = true;
    _noWorker = opts.noWorker ?? false;
    if (opts.baseUrl) {
        // Caller provided an explicit assets base URL — resolve it to absolute
        // on the main thread where location.href is the page URL.
        _baseUrl = resolveAbsolute(opts.baseUrl);
        // Vendor bundle lives at ../vendor/ relative to the assets dir.
        // e.g. baseUrl = http://localhost:4321/dist/assets/
        //   → vendorUrl = http://localhost:4321/dist/vendor/
        _vendorUrl = resolveAbsolute(opts.baseUrl + '../vendor/');
    }
    else {
        // Default: co-located with the library module
        _baseUrl = detectModuleBase();
        _vendorUrl = resolveAbsolute(_baseUrl + '../vendor/');
    }
    if (_noWorker) {
        configureInThread(_baseUrl);
        return;
    }
    const workerUrl = resolveAbsolute(new URL('./worker/worker.bundle.js', import.meta.url).href);
    _bridge = WorkerBridge.create(workerUrl, _baseUrl, _vendorUrl);
}
// ---------------------------------------------------------------------------
// precompile()
// ---------------------------------------------------------------------------
export function precompile(platform) {
    if (!_bridge)
        return;
    _bridge.precompile(platform);
}
// ---------------------------------------------------------------------------
// compile()
// ---------------------------------------------------------------------------
export async function compile(opts) {
    if (!_initiated) {
        throw new Error('retro-compile: call init() before compile().\n' +
            'Example: await init({ baseUrl: "/dist/assets/" });');
    }
    if (_noWorker)
        return compileInThread(opts);
    return _bridge.compile(opts);
}
// ---------------------------------------------------------------------------
// destroy()
// ---------------------------------------------------------------------------
export function destroy() {
    _bridge?.terminate();
    _bridge = null;
    _initiated = false;
}
// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
/** Resolve a URL to absolute using the page's location as anchor. */
function resolveAbsolute(url) {
    if (url.startsWith('http://') || url.startsWith('https://'))
        return url;
    try {
        return new URL(url, location.href).href;
    }
    catch { /* no location */ }
    try {
        return new URL(url, import.meta.url).href;
    }
    catch { /* no meta */ }
    return url;
}
/** Detect the directory containing this module file. */
function detectModuleBase() {
    try {
        return new URL('./', import.meta.url).href;
    }
    catch {
        return './';
    }
}
//# sourceMappingURL=index.js.map