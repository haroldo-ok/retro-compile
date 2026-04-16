// ─── WorkerBridge ────────────────────────────────────────────────────────────

import type { CompileOptions, CompileResult } from '../types.js';
import type { InboundMessage, CompileResultMessage, OutboundMessage } from './protocol.js';
import { normaliseErrors } from './errors.js';

interface Pending {
  resolve: (r: CompileResult) => void;
  reject: (e: Error) => void;
}

export class WorkerBridge {
  private worker: Worker;
  private ready: Promise<void>;
  private pending = new Map<number, Pending>();
  private nextId = 1;
  private baseUrl: string;
  private vendorUrl: string;

  private constructor(worker: Worker, baseUrl: string, vendorUrl: string, ready: Promise<void>) {
    this.worker    = worker;
    this.baseUrl   = baseUrl;
    this.vendorUrl = vendorUrl;
    this.ready     = ready;

    worker.addEventListener('message', (evt: MessageEvent<OutboundMessage>) => {
      this.handleMessage(evt.data);
    });
    worker.addEventListener('error', (evt: ErrorEvent) => {
      const err = new Error(`retro-compile worker crashed: ${evt.message}`);
      for (const p of this.pending.values()) p.reject(err);
      this.pending.clear();
    });
  }

  static create(workerUrl: string, baseUrl: string, vendorUrl: string): WorkerBridge {
    const worker = new Worker(workerUrl, { type: 'module' });

    let resolveReady!: () => void;
    const ready = new Promise<void>(r => { resolveReady = r; });

    const earlyHandler = (evt: MessageEvent<OutboundMessage>) => {
      if (evt.data?.type === 'ready') {
        worker.removeEventListener('message', earlyHandler as EventListener);
        resolveReady();
      }
    };
    worker.addEventListener('message', earlyHandler as EventListener);

    return new WorkerBridge(worker, baseUrl, vendorUrl, ready);
  }

  precompile(platform: import('../types.js').Platform): void {
    const msg: InboundMessage = {
      type: 'preload',
      fs: platform,
      baseUrl: this.baseUrl,
      vendorUrl: this.vendorUrl,
    };
    this.worker.postMessage(msg);
  }

  async compile(opts: CompileOptions): Promise<CompileResult> {
    await this.ready;

    const id       = this.nextId++;
    const language = opts.language ?? 'c';
    const files: Record<string, string | Uint8Array> = opts.files ?? {};

    const msg: InboundMessage = {
      type: 'compile',
      id,
      platform:  opts.platform,
      language,
      source:    opts.source,
      files,
      debug:     opts.debug ?? false,
      baseUrl:   this.baseUrl,
      vendorUrl: this.vendorUrl,
    };

    return new Promise<CompileResult>((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      const transfers: Transferable[] = [];
      for (const v of Object.values(files)) {
        if (v instanceof Uint8Array) transfers.push(v.buffer);
      }
      this.worker.postMessage(msg, transfers);
    });
  }

  terminate() {
    this.worker.terminate();
    const err = new Error('retro-compile: worker terminated');
    for (const p of this.pending.values()) p.reject(err);
    this.pending.clear();
  }

  private handleMessage(msg: OutboundMessage) {
    if (msg.type === 'ready') return;

    if (msg.type === 'error') {
      const p = msg.id != null ? this.pending.get(msg.id) : undefined;
      if (p) { this.pending.delete(msg.id!); p.reject(new Error(msg.message)); }
      else console.error('[retro-compile] Worker error:', msg.message);
      return;
    }

    if (msg.type === 'result') {
      const result = msg as CompileResultMessage;
      const p = this.pending.get(result.id);
      if (!p) return;
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
              msg:  e.message,
              path: e.path,
            }))
          ),
        });
      }
    }
  }
}
