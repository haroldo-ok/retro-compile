// ─── retro-compile public entry point ───────────────────────────────────────

export type {
  Platform,
  Language,
  CompileOptions,
  CompileResult,
  CompileSuccess,
  CompileFailure,
  CompileError,
  SourceMapping,
  Segment,
  InitOptions,
} from './types.js';

import type { CompileOptions, CompileResult, InitOptions } from './types.js';
import type { Platform } from './types.js';
import { WorkerBridge } from './core/bridge.js';
import { compileInThread, configureInThread } from './core/in-thread.js';

// ---------------------------------------------------------------------------
// Module state
// ---------------------------------------------------------------------------

let _bridge:   WorkerBridge | null = null;
let _baseUrl   = './';
let _noWorker  = false;
let _initiated = false;

// ---------------------------------------------------------------------------
// init()
// ---------------------------------------------------------------------------

/**
 * Initialise retro-compile.
 *
 * Must be called once before `compile()` or `precompile()`. In Worker mode
 * (the default) this spawns a Web Worker and waits for it to report ready.
 * Safe to call multiple times — idempotent after the first call.
 *
 * @example
 * ```ts
 * await init({ baseUrl: 'https://cdn.example.com/retro-compile/' });
 * ```
 */
export async function init(opts: InitOptions = {}): Promise<void> {
  if (_initiated) return;
  _initiated = true;

  _baseUrl  = opts.baseUrl  ?? detectBaseUrl();
  _noWorker = opts.noWorker ?? false;

  if (_noWorker) {
    configureInThread(_baseUrl);
    return;
  }

  const workerUrl = resolveWorkerUrl();
  _bridge = WorkerBridge.create(workerUrl, _baseUrl);
}

// ---------------------------------------------------------------------------
// precompile()
// ---------------------------------------------------------------------------

/**
 * Warm up the compiler for a platform.
 *
 * Triggers background loading of the platform's Wasm toolchain and standard
 * library filesystem pack. Call after `init()` and before the user is likely
 * to hit Compile to eliminate cold-start latency on the first build.
 *
 * Safe to call multiple times and safe to call before `init()` (no-op).
 *
 * @example
 * ```ts
 * await init({ baseUrl: '...' });
 * precompile('gb');  // fire-and-forget
 * ```
 */
export function precompile(platform: Platform): void {
  if (!_bridge) return; // not yet initialised — no-op
  _bridge.precompile(platform);
}

// ---------------------------------------------------------------------------
// compile()
// ---------------------------------------------------------------------------

/**
 * Compile source code for a retro platform.
 *
 * ```ts
 * const result = await compile({ platform: 'gb', source: myCode });
 * if (result.ok) {
 *   loadROM(result.rom); // Uint8Array — ready for any emulator
 * } else {
 *   for (const e of result.errors)
 *     console.error(`${e.path}:${e.line} ${e.message}`);
 * }
 * ```
 *
 * @throws If `init()` has not been called.
 */
export async function compile(opts: CompileOptions): Promise<CompileResult> {
  assertInitialised();
  if (_noWorker) return compileInThread(opts);
  return _bridge!.compile(opts);
}

// ---------------------------------------------------------------------------
// destroy()
// ---------------------------------------------------------------------------

/**
 * Shut down the compiler worker and release all resources.
 * After this call `compile()` will throw until `init()` is called again.
 */
export function destroy(): void {
  _bridge?.terminate();
  _bridge    = null;
  _initiated = false;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function assertInitialised() {
  if (!_initiated) {
    throw new Error(
      'retro-compile: call init() before compile().\n' +
      'Example: await init({ baseUrl: "/retro-compile/" });'
    );
  }
}

function resolveWorkerUrl(): string {
  try {
    // import.meta.url = .../dist/index.js → worker is at ./worker/worker.js
    return new URL('./worker/worker.js', import.meta.url).href;
  } catch {
    return _baseUrl + 'worker/worker.js';
  }
}

function detectBaseUrl(): string {
  try {
    return new URL('./', import.meta.url).href;
  } catch {
    return './';
  }
}
