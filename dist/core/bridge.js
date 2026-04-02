// ─── WorkerBridge ────────────────────────────────────────────────────────────
// Manages the compiler Web Worker: spawning, message routing, and the
// public compile() call.  All communication is Promise-based; the caller
// never touches postMessage/onmessage directly.
import { normaliseErrors } from './errors.js';
// ---------------------------------------------------------------------------
// Bridge class
// ---------------------------------------------------------------------------
/**
 * Owns the compiler Web Worker and exposes a single `compile()` method.
 * Create via `WorkerBridge.create(opts)`.
 */
export class WorkerBridge {
    constructor(worker, baseUrl, ready) {
        this.pending = new Map();
        this.nextId = 1;
        this.worker = worker;
        this.baseUrl = baseUrl;
        this.ready = ready;
        worker.addEventListener('message', (evt) => {
            this.handleMessage(evt.data);
        });
        worker.addEventListener('error', (evt) => {
            // Reject all pending calls if the worker dies
            const err = new Error(`retro-compile worker crashed: ${evt.message}`);
            for (const p of this.pending.values())
                p.reject(err);
            this.pending.clear();
        });
    }
    // ── Factory ─────────────────────────────────────────────────────────────
    /**
     * Spawn a new compiler worker and wait for it to signal ready.
     * @param workerUrl  URL of the compiled worker bundle (worker.js).
     * @param baseUrl    Base URL for Wasm blobs and filesystem packs.
     */
    static create(workerUrl, baseUrl) {
        const worker = new Worker(workerUrl, { type: 'module' });
        let resolveReady;
        const ready = new Promise(r => { resolveReady = r; });
        // Intercept the first 'ready' message before the bridge object is wired
        // up — we need to resolve `ready` before any compile() calls come in.
        const earlyHandler = (evt) => {
            if (evt.data?.type === 'ready') {
                worker.removeEventListener('message', earlyHandler);
                resolveReady();
            }
        };
        worker.addEventListener('message', earlyHandler);
        const bridge = new WorkerBridge(worker, baseUrl, ready);
        return bridge;
    }
    // ── Public API ──────────────────────────────────────────────────────────
    /**
     * Warm up the compiler for a platform by preloading its Wasm modules
     * and filesystem packs. Call this after init() and before the user
     * triggers their first compile to eliminate cold-start latency.
     *
     * Safe to call multiple times — cached after first load.
     */
    async precompile(platform) {
        await this.ready;
        const msg = {
            type: 'preload',
            fs: platform, // the worker resolves the FS name from the platform
            baseUrl: this.baseUrl,
        };
        this.worker.postMessage(msg);
        // preload is fire-and-forget from the bridge's perspective —
        // the worker handles it asynchronously and the next compile() will
        // simply find the modules already cached.
    }
    /**
     * Compile source code for a retro platform.
     * Returns a Promise that resolves once the worker finishes.
     */
    async compile(opts) {
        await this.ready; // wait until the worker has initialised
        const id = this.nextId++;
        const language = opts.language ?? 'c';
        const files = opts.files ?? {};
        const msg = {
            type: 'compile',
            id,
            platform: opts.platform,
            language,
            source: opts.source,
            files,
            debug: opts.debug ?? false,
            baseUrl: this.baseUrl,
        };
        return new Promise((resolve, reject) => {
            this.pending.set(id, { resolve, reject });
            // Transfer binary file buffers to avoid copying
            const transfers = [];
            for (const v of Object.values(files)) {
                if (v instanceof Uint8Array)
                    transfers.push(v.buffer);
            }
            this.worker.postMessage(msg, transfers);
        });
    }
    /** Terminate the worker. After this, `compile()` will always throw. */
    terminate() {
        this.worker.terminate();
        const err = new Error('retro-compile: worker terminated');
        for (const p of this.pending.values())
            p.reject(err);
        this.pending.clear();
    }
    // ── Private ─────────────────────────────────────────────────────────────
    handleMessage(msg) {
        if (msg.type === 'ready')
            return; // handled in factory, ignore duplicates
        if (msg.type === 'error') {
            const p = msg.id != null ? this.pending.get(msg.id) : undefined;
            if (p) {
                this.pending.delete(msg.id);
                p.reject(new Error(msg.message));
            }
            else {
                console.error('[retro-compile] Worker error:', msg.message);
            }
            return;
        }
        if (msg.type === 'result') {
            const result = msg;
            const p = this.pending.get(result.id);
            if (!p)
                return; // stale
            this.pending.delete(result.id);
            if (result.ok && result.rom) {
                p.resolve({
                    ok: true,
                    rom: result.rom,
                    symbols: result.symbols,
                    segments: result.segments?.map((s) => ({
                        ...s,
                        type: (s.type === 'rom' || s.type === 'ram') ? s.type : null,
                    })),
                    mappings: result.mappings,
                });
            }
            else {
                p.resolve({
                    ok: false,
                    errors: normaliseErrors((result.errors ?? []).map((e) => ({
                        line: e.line,
                        msg: e.message,
                        path: e.path,
                    }))),
                });
            }
        }
    }
}
//# sourceMappingURL=bridge.js.map