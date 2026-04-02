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
 * Must be called once before `compile()` or `precompile()`. Spawns the
 * compiler Web Worker and waits for it to report ready.
 *
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

  _baseUrl   = opts.baseUrl  ?? detectBaseUrl();
  _noWorker  = opts.noWorker ?? false;

  if (_noWorker) {
    // In-thread mode: no Worker, compiles directly on calling thread.
    // Useful in Node.js, test environments, and restricted origins.
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
 * library filesystem pack. Call this after `init()` and before the user is
 * likely to hit "Compile" to eliminate cold-start latency on the first build.
 *
 * Safe to call multiple times — assets are cached after first load.
 *
 * @example
 * ```ts
 * await init({ baseUrl: '...' });
 * precompile('gb');  // fire-and-forget — no need to await
 * ```
 */
export function precompile(platform: Platform): void {
  if (_noWorker) return; // in-thread mode: nothing to preload
  _bridge?.precompile(platform);
}

// ---------------------------------------------------------------------------
// compile()
// ---------------------------------------------------------------------------

/**
 * Compile source code for a retro platform.
 *
 * Resolves with a {@link CompileResult}. Discriminate on `.ok`:
 *
 * ```ts
 * const result = await compile({ platform: 'gb', source: myCode });
 * if (result.ok) {
 *   loadROM(result.rom); // Uint8Array — ready for any emulator
 * } else {
 *   for (const e of result.errors) console.error(`${e.path}:${e.line} ${e.message}`);
 * }
 * ```
 *
 * @throws If `init()` has not been called.
 */
export async function compile(opts: CompileOptions): Promise<CompileResult> {
  assertInitialised();

  if (_noWorker) {
    return compileInThread(opts);
  }

  return _bridge!.compile(opts);
}

// ---------------------------------------------------------------------------
// destroy()
// ---------------------------------------------------------------------------

/**
 * Shut down the compiler worker and release all resources.
 * After this call `compile()` and `precompile()` will throw until
 * `init()` is called again.
 */
export function destroy(): void {
  _bridge?.terminate();
  _bridge    = null;
  _initiated = false;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function assertInitialised() {
  if (!_initiated) {
    throw new Error(
      'retro-compile: call init() before compile().\n' +
      'Example: await init({ baseUrl: "/retro-compile/" });'
    );
  }
}

/**
 * Resolve the URL of the Web Worker bundle.
 * In ESM: co-located with the main bundle.
 * Falls back to a predictable path relative to the base URL.
 */
function resolveWorkerUrl(): string {
  try {
    return new URL('./worker.js', import.meta.url).href;
  } catch {
    return _baseUrl + 'worker.js';
  }
}

/**
 * Best-effort detection of the base URL for asset loading.
 * Works in ESM (import.meta.url), degrades gracefully to './'.
 */
function detectBaseUrl(): string {
  try {
    return new URL('./', import.meta.url).href;
  } catch {
    return './';
  }
}
