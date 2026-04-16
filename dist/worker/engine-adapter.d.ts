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
import '8bws/src/worker/workertools';
//# sourceMappingURL=engine-adapter.d.ts.map