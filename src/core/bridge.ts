// ─── WorkerBridge ────────────────────────────────────────────────────────────
// Manages the compiler Web Worker: spawning, message routing, and the
// public compile() call.  All communication is Promise-based; the caller
// never touches postMessage/onmessage directly.

import type { CompileOptions, CompileResult, InitOptions } from '../types.js';
import type {
  InboundMessage,
  CompileResultMessage,
  OutboundMessage,
} from './protocol.js';
import { normaliseErrors } from './errors.js';

// ---------------------------------------------------------------------------
// Pending call tracking
// ---------------------------------------------------------------------------

interface Pending {
  resolve: (r: CompileResult) => void;
  reject: (e: Error) => void;
}

// ---------------------------------------------------------------------------
// Bridge class
// ---------------------------------------------------------------------------

/**
 * Owns the compiler Web Worker and exposes a single `compile()` method.
 * Create via `WorkerBridge.create(opts)`.
 */
export class WorkerBridge {
  private worker: Worker;
  private ready: Promise<void>;
  private pending = new Map<number, Pending>();
  private nextId = 1;
  private baseUrl: string;

  private constructor(worker: Worker, baseUrl: string, ready: Promise<void>) {
    this.worker = worker;
    this.baseUrl = baseUrl;
    this.ready = ready;

    worker.addEventListener('message', (evt: MessageEvent<OutboundMessage>) => {
      this.handleMessage(evt.data);
    });

    worker.addEventListener('error', (evt: ErrorEvent) => {
      // Reject all pending calls if the worker dies
      const err = new Error(`retro-compile worker crashed: ${evt.message}`);
      for (const p of this.pending.values()) p.reject(err);
      this.pending.clear();
    });
  }

  // ── Factory ─────────────────────────────────────────────────────────────

  /**
   * Spawn a new compiler worker and wait for it to signal ready.
   * @param workerUrl  URL of the compiled worker bundle (worker.js).
   * @param baseUrl    Base URL for Wasm blobs and filesystem packs.
   */
  static create(workerUrl: string, baseUrl: string): WorkerBridge {
    const worker = new Worker(workerUrl, { type: 'module' });

    let resolveReady!: () => void;
    const ready = new Promise<void>(r => { resolveReady = r; });

    // Intercept the first 'ready' message before the bridge object is wired
    // up — we need to resolve `ready` before any compile() calls come in.
    const earlyHandler = (evt: MessageEvent<OutboundMessage>) => {
      if (evt.data?.type === 'ready') {
        worker.removeEventListener('message', earlyHandler as EventListener);
        resolveReady();
      }
    };
    worker.addEventListener('message', earlyHandler as EventListener);

    const bridge = new WorkerBridge(worker, baseUrl, ready);
    return bridge;
  }

  // ── Public API ──────────────────────────────────────────────────────────

  /**
   * Warm up the compiler for a platform by preloading its Wasm modules
   * and filesystem packs in the background. Fire-and-forget.
   */
  precompile(platform: import('../types.js').Platform): void {
    const msg: InboundMessage = {
      type: 'preload',
      fs:      platform,
      baseUrl: this.baseUrl,
    };
    this.worker.postMessage(msg);
  }

  /**
   * Compile source code for a retro platform.
   * Returns a Promise that resolves once the worker finishes.
   */
  async compile(opts: CompileOptions): Promise<CompileResult> {
    await this.ready; // wait until the worker has initialised

    const id = this.nextId++;
    const language = opts.language ?? 'c';
    const files: Record<string, string | Uint8Array> = opts.files ?? {};

    const msg: InboundMessage = {
      type: 'compile',
      id,
      platform: opts.platform,
      language,
      source: opts.source,
      files,
      debug: opts.debug ?? false,
      baseUrl: this.baseUrl,
    };

    return new Promise<CompileResult>((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      // Transfer binary file buffers to avoid copying
      const transfers: Transferable[] = [];
      for (const v of Object.values(files)) {
        if (v instanceof Uint8Array) transfers.push(v.buffer);
      }
      this.worker.postMessage(msg, transfers);
    });
  }

  /** Terminate the worker. After this, `compile()` will always throw. */
  terminate() {
    this.worker.terminate();
    const err = new Error('retro-compile: worker terminated');
    for (const p of this.pending.values()) p.reject(err);
    this.pending.clear();
  }

  // ── Private ─────────────────────────────────────────────────────────────

  private handleMessage(msg: OutboundMessage) {
    if (msg.type === 'ready') return; // handled in factory, ignore duplicates

    if (msg.type === 'error') {
      const p = msg.id != null ? this.pending.get(msg.id) : undefined;
      if (p) {
        this.pending.delete(msg.id!);
        p.reject(new Error(msg.message));
      } else {
        console.error('[retro-compile] Worker error:', msg.message);
      }
      return;
    }

    if (msg.type === 'result') {
      const result = msg as CompileResultMessage;
      const p = this.pending.get(result.id);
      if (!p) return; // stale
      this.pending.delete(result.id);

      if (result.ok && result.rom) {
        p.resolve({
          ok: true,
          rom: result.rom,
          symbols: result.symbols,
          segments: result.segments?.map((s: { name: string; start: number; size: number; type: string | null }) => ({
            ...s,
            type: (s.type === 'rom' || s.type === 'ram') ? s.type : null,
          })),
          mappings: result.mappings,
        });
      } else {
        p.resolve({
          ok: false,
          errors: normaliseErrors(
            (result.errors ?? []).map((e: { line: number; message: string; path?: string }) => ({
              line: e.line,
              msg: e.message,
              path: e.path,
            }))
          ),
        });
      }
    }
  }
}
