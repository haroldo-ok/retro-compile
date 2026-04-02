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
import { store, builder } from '8bws/src/worker/builder';
import { PLATFORM_PARAMS } from '8bws/src/worker/platforms';
import '8bws/src/worker/workertools';
export interface RetroCompileEngine {
    store: typeof store;
    builder: typeof builder;
    PLATFORM_PARAMS: typeof PLATFORM_PARAMS;
    configure(opts: EngineConfig): void;
    syncFs(meta: Record<string, unknown>, blob: Record<string, unknown>): void;
}
export interface EngineConfig {
    /** Base URL for assets, used to rewrite lib/ XHR requests. */
    baseUrl: string;
}
//# sourceMappingURL=engine-adapter.d.ts.map