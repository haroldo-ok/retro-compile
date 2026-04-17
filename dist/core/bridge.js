// ─── WorkerBridge ────────────────────────────────────────────────────────────
import { normaliseErrors } from './errors.js';
export class WorkerBridge {
    constructor(worker, baseUrl, vendorUrl, ready) {
        this.pending = new Map();
        this.nextId = 1;
        this.worker = worker;
        this.baseUrl = baseUrl;
        this.vendorUrl = vendorUrl;
        this.ready = ready;
        worker.addEventListener('message', (evt) => {
            this.handleMessage(evt.data);
        });
        worker.addEventListener('error', (evt) => {
            const err = new Error(`retro-compile worker crashed: ${evt.message}`);
            for (const p of this.pending.values())
                p.reject(err);
            this.pending.clear();
        });
    }
    static create(workerUrl, baseUrl, vendorUrl) {
        // Load as a classic worker (no type:'module') so importScripts() works
        // inside the vendor bundle which uses it to load Wasm JS glue files.
        const worker = new Worker(workerUrl);
        let resolveReady;
        const ready = new Promise(r => { resolveReady = r; });
        const earlyHandler = (evt) => {
            if (evt.data?.type === 'ready') {
                worker.removeEventListener('message', earlyHandler);
                resolveReady();
            }
        };
        worker.addEventListener('message', earlyHandler);
        return new WorkerBridge(worker, baseUrl, vendorUrl, ready);
    }
    precompile(platform) {
        const msg = {
            type: 'preload',
            fs: platform,
            baseUrl: this.baseUrl,
            vendorUrl: this.vendorUrl,
        };
        this.worker.postMessage(msg);
    }
    async compile(opts) {
        await this.ready;
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
            vendorUrl: this.vendorUrl,
        };
        return new Promise((resolve, reject) => {
            this.pending.set(id, { resolve, reject });
            const transfers = [];
            for (const v of Object.values(files)) {
                if (v instanceof Uint8Array)
                    transfers.push(v.buffer);
            }
            this.worker.postMessage(msg, transfers);
        });
    }
    terminate() {
        this.worker.terminate();
        const err = new Error('retro-compile: worker terminated');
        for (const p of this.pending.values())
            p.reject(err);
        this.pending.clear();
    }
    handleMessage(msg) {
        if (msg.type === 'ready')
            return;
        if (msg.type === 'error') {
            const p = msg.id != null ? this.pending.get(msg.id) : undefined;
            if (p) {
                this.pending.delete(msg.id);
                p.reject(new Error(msg.message));
            }
            else
                console.error('[retro-compile] Worker error:', msg.message);
            return;
        }
        if (msg.type === 'result') {
            const result = msg;
            const p = this.pending.get(result.id);
            if (!p)
                return;
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