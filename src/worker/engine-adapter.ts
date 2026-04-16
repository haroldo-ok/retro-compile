/**
 * src/worker/engine-adapter.ts
 *
 * Entry point for bundle-vendor-node.mjs (and the optional build-vendor.mjs
 * if esbuild is available). Gets bundled into dist/vendor/builder-bundle.js.
 *
 * Imports the three pieces we need from 8bitworkshop and registers them as
 * globalThis.retroCompileEngine — the interface worker.ts expects.
 *
 * When bundled as an IIFE by bundle-vendor-node.mjs the @ts-ignore import
 * paths are resolved by the bundler's module-id system; when bundled by
 * esbuild they are resolved via path aliases in build-vendor.mjs.
 *
 * This file is NOT part of the main library bundle — it only exists inside
 * the vendor bundle that the compiler Web Worker fetches at runtime.
 */

// @ts-ignore — resolved at bundle time
import { store, builder } from '8bws/src/worker/builder';
// @ts-ignore
import { PLATFORM_PARAMS } from '8bws/src/worker/platforms';
// @ts-ignore — side-effect: populates TOOLS registry used by builder
import '8bws/src/worker/workertools';
// @ts-ignore — provides emglobal, fsMeta used by syncFs
import { emglobal, fsMeta } from '8bws/src/worker/wasmutils';

// ── XHR interceptor ──────────────────────────────────────────────────────────
// 8bitworkshop's populateExtraFiles() fetches platform lib files (crt0.rel,
// neslib2.lib, etc.) via synchronous XHR with paths relative to the worker.
// We intercept and rewrite those paths to point at our hosted assets.

let _libBaseUrl = './assets/lib/';

function installXhrInterceptor(libBase: string) {
  _libBaseUrl = libBase;
  const OrigXHR = (globalThis as any).XMLHttpRequest;
  if (!OrigXHR || OrigXHR.__rc_patched) return;

  function PatchedXHR(this: any) {
    const inner = new OrigXHR();
    return new Proxy(inner, {
      get(_: unknown, prop: string) {
        if (prop === 'open') {
          return (method: string, url: string, async?: boolean) => {
            const m = url.match(/(?:src\/worker\/)?lib\/(.+)$/);
            if (m) url = _libBaseUrl + m[1];
            return inner.open.call(inner, method, url, async);
          };
        }
        const v = inner[prop];
        return typeof v === 'function' ? v.bind(inner) : v;
      },
      set(_: unknown, prop: string, val: unknown) {
        inner[prop] = val;
        return true;
      },
    });
  }
  (PatchedXHR as any).__rc_patched = true;
  (globalThis as any).XMLHttpRequest = PatchedXHR;
}

// ── Public engine interface ───────────────────────────────────────────────────

const engine = {
  store,
  builder,
  PLATFORM_PARAMS,

  configure(opts: { baseUrl: string }) {
    const base = opts.baseUrl.endsWith('/') ? opts.baseUrl : opts.baseUrl + '/';
    installXhrInterceptor(base + 'lib/');
  },

  syncFs(meta: Record<string, unknown>, blob: Record<string, unknown>) {
    // Push preloaded FS metadata into the scope that setupFS() reads from
    Object.assign(fsMeta as Record<string, unknown>, meta);
    const g = globalThis as Record<string, unknown>;
    g['fsBlob'] = g['fsBlob'] ?? {};
    Object.assign(g['fsBlob'] as Record<string, unknown>, blob);
    // Also push into emglobal in case it differs from globalThis
    if (emglobal !== globalThis) {
      Object.assign((emglobal as Record<string, unknown>)['fsMeta'] ?? {}, meta);
    }
  },
};

(globalThis as any).retroCompileEngine = engine;
