export type { Platform, Language, CompileOptions, CompileResult, CompileSuccess, CompileFailure, CompileError, SourceMapping, Segment, InitOptions, } from './types.js';
import type { CompileOptions, CompileResult, InitOptions } from './types.js';
import type { Platform } from './types.js';
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
export declare function init(opts?: InitOptions): Promise<void>;
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
export declare function precompile(platform: Platform): void;
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
export declare function compile(opts: CompileOptions): Promise<CompileResult>;
/**
 * Shut down the compiler worker and release all resources.
 * After this call `compile()` and `precompile()` will throw until
 * `init()` is called again.
 */
export declare function destroy(): void;
//# sourceMappingURL=index.d.ts.map