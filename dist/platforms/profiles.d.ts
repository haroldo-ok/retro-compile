import type { Platform } from '../types.js';
/** Supported compiler tool IDs — match 8bitworkshop's TOOLS registry keys. */
export type CompilerTool = 'sdcc' | 'cc65' | 'cmoc' | 'sdasz80' | 'sdasgb' | 'ca65' | 'xasm6809';
/** Supported assembler tool IDs. */
export type AssemblerTool = 'sdasz80' | 'sdasgb' | 'ca65' | 'lwasm' | 'xasm6809';
/** Supported linker tool IDs. */
export type LinkerTool = 'sdldz80' | 'ld65' | 'lwlink';
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
    /** Extra .rel / .o / .a / .lib files to inject before linking. */
    extra_link_files?: string[];
    /** Extra flags forwarded to the linker after the standard set. */
    extra_link_args?: string[];
    /** #define symbols injected by the preprocessor. */
    defines?: string[];
    /** Extra flags forwarded to the C compiler. */
    extra_compile_args?: string[];
    /** Header files that must be present in the compiler FS. */
    extra_compile_files?: string[];
    /** Extra flags forwarded to the preprocessor (mcpp). */
    extra_preproc_args?: string[];
    /** ld65 linker config file (e.g. `'neslib2.cfg'`). */
    cfgfile?: string;
    /** ld65 library args — object files and libs in link order. */
    libargs?: string[];
    /** Trigger Game Boy header checksum patching after link. */
    gbChecksumPatch?: boolean;
    /**
     * If true, this platform cannot be compiled with the current asset set.
     * compile() will return an error immediately rather than failing mid-build.
     */
    unavailable?: string;
}
export declare const PLATFORM_PROFILES: Record<Platform, PlatformProfile>;
/** Convenience — look up a profile and throw clearly if it's missing. */
export declare function getProfile(platform: Platform): PlatformProfile;
//# sourceMappingURL=profiles.d.ts.map