// ─── Platform profiles ───────────────────────────────────────────────────────
// Each profile describes:
//   • which tool runs first (the "compiler" step)
//   • which filesystem pack(s) to preload
//   • the memory map parameters forwarded to the linker
//   • any extra flags or library files
//
// This is the single source of truth that replaces the scattered
// PLATFORM_PARAMS + TOOL_PRELOADFS combination in 8bitworkshop.

import type { Platform } from '../types.js';

// ---------------------------------------------------------------------------
// Internal type definitions
// ---------------------------------------------------------------------------

/** Supported compiler tool IDs — match 8bitworkshop's TOOLS registry keys. */
export type CompilerTool =
  | 'sdcc'        // C → Z80 asm  (via SDCC)
  | 'cc65'        // C → 6502 asm (via CC65)
  | 'cmoc'        // C → 6809 asm (via CMOC)
  | 'sdasz80'     // Z80 ASM direct
  | 'sdasgb'      // Game Boy ASM direct
  | 'ca65'        // 6502 ASM direct
  | 'xasm6809';   // 6809 ASM direct

/** Supported assembler tool IDs. */
export type AssemblerTool =
  | 'sdasz80'
  | 'sdasgb'
  | 'ca65'
  | 'lwasm'
  | 'xasm6809';

/** Supported linker tool IDs. */
export type LinkerTool =
  | 'sdldz80'
  | 'ld65'
  | 'lwlink';

/** CPU architecture shorthand — used for linker flags and fs selection. */
export type Arch = 'z80' | 'gbz80' | '6502' | '6809' | 'arm32';

/**
 * Full description of how to build for one platform.
 * Internal — not exported in the public API surface.
 */
export interface PlatformProfile {
  /** Human-readable display name. */
  name: string;

  /** CPU architecture. */
  arch: Arch;

  /**
   * Which tool handles the first build step.
   * For C sources this is the C compiler.
   * For ASM sources it's the assembler directly.
   */
  cCompiler: CompilerTool;
  asmAssembler: AssemblerTool;
  linker: LinkerTool;

  /**
   * Filesystem packs to preload before building.
   * These are Emscripten WORKERFS bundles (fssdcc.js / fs65-nes.js / etc.)
   * that contain standard headers and libraries.
   */
  filesystems: string[];

  // ── Memory map ────────────────────────────────────────────────────────────

  /** Start address of ROM in the address space (IHX / ihx2sms origin). */
  rom_start?: number;
  /** Start address of the _CODE segment inside ROM. */
  code_start: number;
  /** Total ROM size in bytes. */
  rom_size?: number;
  /** _DATA segment base address (RAM). */
  data_start: number;
  /** _DATA segment size in bytes. */
  data_size?: number;
  /** Top of stack. */
  stack_end?: number;
  /** For 6502: start address of the _CODE segment (cc65-specific). */
  codeseg_start?: number;

  // ── Linker extras ─────────────────────────────────────────────────────────

  /** Extra .rel / .o / .a / .lib files to inject before linking. */
  extra_link_files?: string[];
  /** Extra flags forwarded to the linker after the standard set. */
  extra_link_args?: string[];

  // ── Compiler / preprocessor extras ───────────────────────────────────────

  /** #define symbols injected by the preprocessor. */
  defines?: string[];
  /** Extra flags forwarded to the C compiler. */
  extra_compile_args?: string[];
  /** Header files that must be present in the compiler FS. */
  extra_compile_files?: string[];
  /** Extra flags forwarded to the preprocessor (mcpp). */
  extra_preproc_args?: string[];

  // ── CC65-specific ─────────────────────────────────────────────────────────

  /** ld65 linker config file (e.g. `'neslib2.cfg'`). */
  cfgfile?: string;
  /** ld65 library args — object files and libs in link order. */
  libargs?: string[];

  // ── Game Boy specifics ────────────────────────────────────────────────────

  /** Trigger Game Boy header checksum patching after link. */
  gbChecksumPatch?: boolean;
}

// ---------------------------------------------------------------------------
// Profile registry
// ---------------------------------------------------------------------------

export const PLATFORM_PROFILES: Record<Platform, PlatformProfile> = {

  // ── Game Boy ──────────────────────────────────────────────────────────────
  gb: {
    name: 'Nintendo Game Boy',
    arch: 'gbz80',
    cCompiler: 'sdcc',
    asmAssembler: 'sdasgb',
    linker: 'sdldz80',
    filesystems: ['sdcc'],
    rom_start: 0x0,
    code_start: 0x0,
    codeseg_start: 0x200,
    rom_size: 0x8000,
    data_start: 0xc0a0,
    data_size: 0x1f60,
    stack_end: 0xe000,
    gbChecksumPatch: true,
    extra_link_files: ['gbz80.lib', 'gb.lib'],
    extra_link_args: [
      '-l', 'gb',
      '-g', '_shadow_OAM=0xC000',
      '-g', '.STACK=0xE000',
      '-g', '.refresh_OAM=0xFF80',
    ],
  },

  // ── ColecoVision ──────────────────────────────────────────────────────────
  coleco: {
    name: 'ColecoVision',
    arch: 'z80',
    cCompiler: 'sdcc',
    asmAssembler: 'sdasz80',
    linker: 'sdldz80',
    filesystems: ['sdcc'],
    rom_start: 0x8000,
    code_start: 0x8100,
    rom_size: 0x8000,
    data_start: 0x7000,
    data_size: 0x400,
    stack_end: 0x8000,
    extra_preproc_args: ['-I', '/share/include/coleco', '-D', 'CV_CV'],
    extra_link_args: [
      '-k', '/share/lib/coleco',
      '-l', 'libcv',
      '-l', 'libcvu',
      'crt0.rel',
    ],
  },

  // ── MSX ───────────────────────────────────────────────────────────────────
  msx: {
    name: 'MSX',
    arch: 'z80',
    cCompiler: 'sdcc',
    asmAssembler: 'sdasz80',
    linker: 'sdldz80',
    filesystems: ['sdcc'],
    rom_start: 0x4000,
    code_start: 0x4000,
    rom_size: 0x8000,
    data_start: 0xc000,
    data_size: 0x3000,
    stack_end: 0xffff,
    extra_link_args: ['crt0-msx.rel'],
    extra_link_files: ['crt0-msx.rel', 'crt0-msx.lst'],
  },

  // ── ZX Spectrum ───────────────────────────────────────────────────────────
  zx: {
    name: 'ZX Spectrum',
    arch: 'z80',
    cCompiler: 'sdcc',
    asmAssembler: 'sdasz80',
    linker: 'sdldz80',
    filesystems: ['sdcc'],
    code_start: 0x5ccb,
    rom_size: 0xff58 - 0x5ccb,
    data_start: 0xf000,
    data_size: 0xfe00 - 0xf000,
    stack_end: 0xff58,
    extra_link_args: ['crt0-zx.rel'],
    extra_link_files: ['crt0-zx.rel', 'crt0-zx.lst'],
  },

  // ── Midway 8080 B&W arcade ────────────────────────────────────────────────
  mw8080bw: {
    name: 'Midway 8080 B&W',
    arch: 'z80',
    cCompiler: 'sdcc',
    asmAssembler: 'sdasz80',
    linker: 'sdldz80',
    filesystems: ['sdcc'],
    code_start: 0x0,
    rom_size: 0x2000,
    data_start: 0x2000,
    data_size: 0x400,
    stack_end: 0x2400,
  },

  // ── Galaxian arcade ───────────────────────────────────────────────────────
  galaxian: {
    name: 'Galaxian arcade',
    arch: 'z80',
    cCompiler: 'sdcc',
    asmAssembler: 'sdasz80',
    linker: 'sdldz80',
    filesystems: ['sdcc'],
    code_start: 0x0,
    rom_size: 0x4000,
    data_start: 0x4000,
    data_size: 0x400,
    stack_end: 0x4800,
  },

  // ── Generic Z80 ───────────────────────────────────────────────────────────
  base_z80: {
    name: 'Generic Z80',
    arch: 'z80',
    cCompiler: 'sdcc',
    asmAssembler: 'sdasz80',
    linker: 'sdldz80',
    filesystems: ['sdcc'],
    code_start: 0x0,
    rom_size: 0x8000,
    data_start: 0x8000,
    data_size: 0x8000,
    stack_end: 0x0,
  },

  // ── NES ───────────────────────────────────────────────────────────────────
  nes: {
    name: 'Nintendo NES',
    arch: '6502',
    cCompiler: 'cc65',
    asmAssembler: 'ca65',
    linker: 'ld65',
    filesystems: ['65-nes'],
    code_start: 0x8000,
    data_start: 0x200,
    defines: ['__NES__'],
    cfgfile: 'neslib2.cfg',
    libargs: [
      'crt0.o', 'nes.lib', 'neslib2.lib',
      '-D', 'NES_MAPPER=0',
      '-D', 'NES_PRG_BANKS=2',
      '-D', 'NES_CHR_BANKS=1',
      '-D', 'NES_MIRRORING=0',
    ],
    extra_link_files: ['crt0.o', 'neslib2.lib', 'neslib2.cfg', 'nesbanked.cfg'],
  },

  // ── Commodore 64 ──────────────────────────────────────────────────────────
  c64: {
    name: 'Commodore 64',
    arch: '6502',
    cCompiler: 'cc65',
    asmAssembler: 'ca65',
    linker: 'ld65',
    filesystems: ['65-c64'],
    code_start: 0x810,
    data_start: 0x200,
    defines: ['__CBM__', '__C64__'],
    cfgfile: 'c64.cfg',
    libargs: ['c64.lib'],
  },

  // ── Atari 2600 VCS ────────────────────────────────────────────────────────
  vcs: {
    name: 'Atari 2600 VCS',
    arch: '6502',
    cCompiler: 'cc65',
    asmAssembler: 'ca65',
    linker: 'ld65',
    filesystems: ['65-atari2600'],
    code_start: 0x1000,
    data_start: 0x80,
    data_size: 0x80,
    defines: ['__ATARI2600__'],
    cfgfile: 'atari2600.cfg',
    libargs: ['crt0.o', 'atari2600.lib'],
    extra_link_files: ['crt0.o', 'atari2600.cfg'],
  },

  // ── Apple II ──────────────────────────────────────────────────────────────
  apple2: {
    name: 'Apple II',
    arch: '6502',
    cCompiler: 'cc65',
    asmAssembler: 'ca65',
    linker: 'ld65',
    filesystems: ['65-apple2'],
    code_start: 0x803,
    data_start: 0x200,
    defines: ['__APPLE2__'],
    cfgfile: 'apple2.cfg',
    libargs: ['--lib-path', '/share/target/apple2/drv', 'apple2.lib'],
  },

  // ── Atari 8-bit 800XL ─────────────────────────────────────────────────────
  'atari8-800xl': {
    name: 'Atari 8-bit 800XL',
    arch: '6502',
    cCompiler: 'cc65',
    asmAssembler: 'ca65',
    linker: 'ld65',
    filesystems: ['65-atari8'],
    code_start: 0x2000,
    data_start: 0x200,
    defines: ['__ATARI__'],
    cfgfile: 'atari-cart.cfg',
    libargs: ['atari.lib', '-D', '__CARTFLAGS__=4'],
  },

  // ── Vectrex ───────────────────────────────────────────────────────────────
  vectrex: {
    name: 'GCE Vectrex',
    arch: '6809',
    cCompiler: 'cmoc',
    asmAssembler: 'xasm6809',
    linker: 'lwlink',
    filesystems: [],         // no prebuilt fs pack; extra files loaded from lib/
    code_start: 0x0,
    rom_size: 0x8000,
    data_start: 0xc880,
    data_size: 0x380,
    stack_end: 0xcc00,
    extra_compile_files: ['assert.h', 'cmoc.h', 'stdarg.h', 'vectrex.h', 'stdlib.h', 'bios.h'],
    extra_compile_args: ['--vectrex'],
    extra_link_files: ['vectrex.scr', 'libcmoc-crt-vec.a', 'libcmoc-std-vec.a'],
    extra_link_args: ['-svectrex.scr', '-lcmoc-crt-vec', '-lcmoc-std-vec'],
  },

  // ── Williams Z80 arcade ───────────────────────────────────────────────────
  'williams-z80': {
    name: 'Williams arcade (Z80)',
    arch: 'z80',
    cCompiler: 'sdcc',
    asmAssembler: 'sdasz80',
    linker: 'sdldz80',
    filesystems: ['sdcc'],
    code_start: 0x0,
    rom_size: 0x9800,
    data_start: 0x9800,
    data_size: 0x2800,
    stack_end: 0xc000,
  },
};

/** Convenience — look up a profile and throw clearly if it's missing. */
export function getProfile(platform: Platform): PlatformProfile {
  const p = PLATFORM_PROFILES[platform];
  if (!p) throw new Error(`retro-compile: unknown platform '${platform}'`);
  return p;
}
