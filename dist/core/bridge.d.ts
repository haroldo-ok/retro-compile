import type { CompileOptions, CompileResult } from '../types.js';
/**
 * Owns the compiler Web Worker and exposes a single `compile()` method.
 * Create via `WorkerBridge.create(opts)`.
 */
export declare class WorkerBridge {
    private worker;
    private ready;
    private pending;
    private nextId;
    private baseUrl;
    private constructor();
    /**
     * Spawn a new compiler worker and wait for it to signal ready.
     * @param workerUrl  URL of the compiled worker bundle (worker.js).
     * @param baseUrl    Base URL for Wasm blobs and filesystem packs.
     */
    static create(workerUrl: string, baseUrl: string): WorkerBridge;
    /**
     * Warm up the compiler for a platform by preloading its Wasm modules
     * and filesystem packs. Call this after init() and before the user
     * triggers their first compile to eliminate cold-start latency.
     *
     * Safe to call multiple times — cached after first load.
     */
    precompile(platform: import('../types.js').Platform): Promise<void>;
    /**
     * Compile source code for a retro platform.
     * Returns a Promise that resolves once the worker finishes.
     */
    compile(opts: CompileOptions): Promise<CompileResult>;
    /** Terminate the worker. After this, `compile()` will always throw. */
    terminate(): void;
    private handleMessage;
}
//# sourceMappingURL=bridge.d.ts.map