// ─── Public types for retro-compile ────────────────────────────────────────
// Everything a consumer needs. Nothing internal leaks through here.

// ---------------------------------------------------------------------------
// Platform identifiers
// ---------------------------------------------------------------------------

/** Every platform the library supports. */
export type Platform =
  // Z80 family
  | 'gb'               // Nintendo Game Boy (SDCC → sdasgb → sdldz80)
  | 'coleco'           // ColecoVision      (SDCC → sdasz80 → sdldz80)
  | 'msx'              // MSX               (SDCC → sdasz80 → sdldz80)
  | 'zx'               // ZX Spectrum       (SDCC → sdasz80 → sdldz80)
  | 'mw8080bw'         // Midway 8080 B&W arcade
  | 'galaxian'         // Galaxian arcade
  | 'base_z80'         // Generic Z80
  // 6502 family
  | 'nes'              // Nintendo NES      (CC65 → CA65 → LD65)
  | 'c64'              // Commodore 64      (CC65 → CA65 → LD65)
  | 'vcs'              // Atari 2600 VCS    (CC65 → CA65 → LD65)
  | 'apple2'           // Apple II
  | 'atari8-800xl'     // Atari 8-bit
  // 6809 family
  | 'vectrex'          // GCE Vectrex       (CMOC → LWASM → LWLINK)
  | 'williams-z80';    // Williams arcade (Z80 variant)

/** Source language for the input file. */
export type Language = 'c' | 'asm';

// ---------------------------------------------------------------------------
// Input
// ---------------------------------------------------------------------------

/**
 * Options for a single compilation.
 *
 * @example
 * ```ts
 * const result = await compile({
 *   platform: 'gb',
 *   language: 'c',
 *   source: myGBSource,
 * });
 * ```
 */
export interface CompileOptions {
  /** Target retro platform. */
  platform: Platform;

  /** Source language. Defaults to `'c'`. */
  language?: Language;

  /**
   * Main source file content.
   * For C: plain C source text.
   * For ASM: target-specific assembly (Z80 SDAS syntax, CA65 syntax, etc.).
   */
  source: string;

  /**
   * Additional files available during compilation.
   * Keys are filenames (e.g. `'sprites.h'`, `'data.inc'`),
   * values are file contents as string or binary data.
   */
  files?: Record<string, string | Uint8Array>;

  /**
   * If true, include source-to-binary mapping tables in the result.
   * Useful for building debuggers or disassembly views.
   * Slightly increases compilation time. Defaults to `false`.
   */
  debug?: boolean;
}

// ---------------------------------------------------------------------------
// Output
// ---------------------------------------------------------------------------

/** A single compiler/assembler/linker diagnostic. */
export interface CompileError {
  /** 1-based line number within `path`. */
  line: number;
  /** 1-based column number, if available. */
  col?: number;
  /** File the error originated in. May be a header. */
  path?: string;
  /** Human-readable error text. */
  message: string;
  /** `'error'` stops the build; `'warning'` does not. */
  severity: 'error' | 'warning';
}

/** Source-to-binary mapping entry (only present when `debug: true`). */
export interface SourceMapping {
  /** Source file path. */
  path: string;
  /** 1-based line in that file. */
  line: number;
  /** ROM byte offset this line compiled to. */
  romOffset: number;
  /** Assembly instructions at that offset, if available. */
  insns?: string;
}

/** Symbol (label) from the linker map. */
export interface Symbol {
  name: string;
  /** ROM or RAM address. */
  address: number;
}

/** Memory segment from the linker. */
export interface Segment {
  name: string;
  start: number;
  size: number;
  /** `'rom'` = stored in ROM image; `'ram'` = lives in RAM at runtime. */
  type: 'rom' | 'ram' | null;
}

/** Returned when compilation succeeds. */
export interface CompileSuccess {
  ok: true;
  /** The compiled ROM binary, ready to load into an emulator. */
  rom: Uint8Array;
  /** Symbols exported by the linker, if any. */
  symbols?: Record<string, number>;
  /** Segment layout from the linker. */
  segments?: Segment[];
  /** Source mappings (only when `debug: true`). */
  mappings?: SourceMapping[];
}

/** Returned when compilation fails. */
export interface CompileFailure {
  ok: false;
  /** All errors and warnings emitted during the build. */
  errors: CompileError[];
}

/** The result of a `compile()` call. Discriminate on `.ok`. */
export type CompileResult = CompileSuccess | CompileFailure;

// ---------------------------------------------------------------------------
// Initialisation
// ---------------------------------------------------------------------------

/**
 * Options passed to `init()`.
 *
 * @example
 * ```ts
 * await init({ baseUrl: 'https://cdn.example.com/retro-compile/' });
 * ```
 */
export interface InitOptions {
  /**
   * Base URL where the library's static assets (Wasm blobs, filesystem packs)
   * are hosted. Must end with `/`.
   *
   * Defaults to the URL of the loaded script if detectable, otherwise `'./'`.
   */
  baseUrl?: string;

  /**
   * If `true`, compile() runs on the calling thread instead of spawning a
   * Web Worker. Useful in environments where Workers are unavailable.
   * Will block the main thread during compilation. Defaults to `false`.
   */
  noWorker?: boolean;
}
