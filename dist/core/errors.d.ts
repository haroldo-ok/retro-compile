import type { CompileError } from '../types.js';
export interface RawWorkerError {
    line: number;
    msg: string;
    path?: string;
}
/**
 * Convert an array of raw worker errors (which may come from any tool) into
 * the clean, uniform CompileError shape exposed in the public API.
 */
export declare function normaliseErrors(raw: RawWorkerError[]): CompileError[];
/**
 * MSVC-style: `file.c(42) : error: message`
 * Used by SDCC and CC65.
 */
export declare function makeMsvcMatcher(errors: RawWorkerError[], fallbackPath: string): (s: string) => void;
/**
 * SDAS assembler: `?ASxxxx-Error-<o> in line 12 of main.asm`
 */
export declare function makeSdasMatcher(errors: RawWorkerError[], fallbackPath: string): (s: string) => void;
/**
 * SDLD linker: `?ASlink-Warning-Undefined Global ...`
 */
export declare function makeSdldMatcher(errors: RawWorkerError[]): (s: string) => void;
/**
 * mcpp preprocessor: `<stdin>:12: error: ...`
 */
export declare function makeMcppMatcher(errors: RawWorkerError[], fallbackPath: string): (s: string) => void;
/**
 * CA65 assembler: `main.s(42): Error: ...`
 */
export declare function makeCa65Matcher(errors: RawWorkerError[], fallbackPath: string): (s: string) => void;
//# sourceMappingURL=errors.d.ts.map