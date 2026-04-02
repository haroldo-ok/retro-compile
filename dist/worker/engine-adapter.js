/**
 * src/worker/engine-adapter.ts
 *
 * Wraps 8bitworkshop's builder, store, and PLATFORM_PARAMS in the clean
 * interface that worker.ts expects as `retroCompileEngine`.
 *
 * This file is the entry point for build-vendor.mjs. esbuild bundles it
 * (and everything it imports from 8bitworkshop) into an IIFE that runs
 * inside the compiler Web Worker and registers on globalThis.
 *
 * The vendor bundle path:
 *   engine-adapter.ts  →  esbuild (IIFE)  →  dist/vendor/builder-bundle.js
 *
 * The worker fetches builder-bundle.js and runs it with new Function(code)().
 * After that, globalThis.retroCompileEngine is the object below.
 */
// ─── 8bitworkshop imports ────────────────────────────────────────────────────
// These are resolved by esbuild at bundle time using the --8bws path.
// They are NOT bundled into the main library — only into builder-bundle.js.
//
// The import paths here use path aliases that build-vendor.mjs rewrites
// before bundling (replacing '8bws/' with the actual 8bitworkshop root).
// @ts-ignore — resolved by build-vendor.mjs
import { store, builder } from '8bws/src/worker/builder';
// @ts-ignore
import { PLATFORM_PARAMS } from '8bws/src/worker/platforms';
// @ts-ignore — side-effect: populates TOOLS registry
import '8bws/src/worker/workertools';
// @ts-ignore — side-effect: provides emglobal shims
import { emglobal, fsMeta } from '8bws/src/worker/wasmutils';
// ─── XHR interception ────────────────────────────────────────────────────────
// 8bitworkshop's populateExtraFiles() fetches platform library files
// (crt0.rel, neslib2.lib, etc.) via synchronous XHR from a relative path:
//   xhr.open("GET", "../../src/worker/lib/<platform>/<file>", false)
//
// Inside a Web Worker there is no concept of "relative to the HTML page",
// so we intercept XMLHttpRequest and rewrite those URLs to use our baseUrl.
let _libBaseUrl = './assets/lib/';
function installXhrInterceptor(libBaseUrl) {
    _libBaseUrl = libBaseUrl;
    // The Emscripten modules in 8bws use the global XMLHttpRequest.
    // We replace it with a thin wrapper that rewrites lib/ paths.
    const OrigXHR = globalThis.XMLHttpRequest;
    if (!OrigXHR || OrigXHR.__rc_patched)
        return;
    function PatchedXHR() {
        const inner = new OrigXHR();
        // Proxy all properties and methods
        const handler = {
            get(_, prop) {
                if (prop === 'open') {
                    return function (method, url, async) {
                        const rewritten = rewriteLibUrl(url);
                        return inner.open.call(inner, method, rewritten, async);
                    };
                }
                const val = inner[prop];
                return typeof val === 'function' ? val.bind(inner) : val;
            },
            set(_, prop, value) {
                inner[prop] = value;
                return true;
            },
        };
        return new Proxy(inner, handler);
    }
    PatchedXHR.__rc_patched = true;
    globalThis.XMLHttpRequest = PatchedXHR;
}
/**
 * Rewrite an 8bitworkshop-internal lib URL to point at our hosted assets.
 * Input:  "../../src/worker/lib/coleco/crt0.rel"
 * Output: "<libBaseUrl>/coleco/crt0.rel"
 */
function rewriteLibUrl(url) {
    // Match paths that reference the 8bitworkshop lib directory
    const m = url.match(/(?:src\/worker\/)?lib\/(.+)$/);
    if (m)
        return _libBaseUrl + m[1];
    return url;
}
// ─── Filesystem loader bridge ─────────────────────────────────────────────────
// 8bitworkshop's loadFilesystem() uses synchronous XHR. We've already
// preloaded the FS data in worker.ts using async fetch, and stored the
// results in globalThis.fsMeta / globalThis.fsBlob. The emglobal shim
// reads from there, so no extra work is needed here — but we do need to
// ensure the fsMeta entries are visible to setupFS() calls.
function syncFsMeta(meta, blob) {
    // emglobal is the same object as globalThis inside a Worker
    for (const [k, v] of Object.entries(meta)) {
        fsMeta[k] = v;
    }
    // fsBlob is read by WORKERFS mount; it lives on emglobal too
    const fsBlob = emglobal['fsBlob'] ?? {};
    for (const [k, v] of Object.entries(blob)) {
        fsBlob[k] = v;
    }
    emglobal['fsBlob'] = fsBlob;
}
const engine = {
    store,
    builder,
    PLATFORM_PARAMS,
    configure({ baseUrl }) {
        const libUrl = baseUrl.endsWith('/') ? baseUrl + 'lib/' : baseUrl + '/lib/';
        installXhrInterceptor(libUrl);
    },
    syncFs(meta, blob) {
        syncFsMeta(meta, blob);
    },
};
// Register on globalThis so worker.ts can find it after new Function(code)()
globalThis.retroCompileEngine = engine;
//# sourceMappingURL=engine-adapter.js.map