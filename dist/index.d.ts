export type { Platform, Language, CompileOptions, CompileResult, CompileSuccess, CompileFailure, CompileError, SourceMapping, Segment, InitOptions, } from './types.js';
import type { CompileOptions, CompileResult, InitOptions } from './types.js';
import type { Platform } from './types.js';
export declare function init(opts?: InitOptions): Promise<void>;
export declare function precompile(platform: Platform): void;
export declare function compile(opts: CompileOptions): Promise<CompileResult>;
export declare function destroy(): void;
//# sourceMappingURL=index.d.ts.map