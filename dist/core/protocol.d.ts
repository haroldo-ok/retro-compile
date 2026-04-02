import type { Platform, Language } from '../types.js';
/** Ask the worker to preload a named filesystem pack. */
export interface PreloadMessage {
    type: 'preload';
    /** Filesystem name, e.g. `'sdcc'` or `'65-nes'`. */
    fs: string;
    /** Base URL where `fs<name>.js` and `fs<name>.js.metadata` live. */
    baseUrl: string;
}
/** Ask the worker to compile source for a platform. */
export interface CompileMessage {
    type: 'compile';
    id: number;
    platform: Platform;
    language: Language;
    source: string;
    files: Record<string, string | Uint8Array>;
    debug: boolean;
    baseUrl: string;
}
/** Reset the worker's in-memory file store. */
export interface ResetMessage {
    type: 'reset';
}
export type InboundMessage = PreloadMessage | CompileMessage | ResetMessage;
/** Worker is ready to receive compile requests. */
export interface ReadyMessage {
    type: 'ready';
}
/** A compile job finished (success or failure). */
export interface CompileResultMessage {
    type: 'result';
    id: number;
    ok: boolean;
    rom?: Uint8Array;
    symbols?: Record<string, number>;
    segments?: Array<{
        name: string;
        start: number;
        size: number;
        type: string | null;
    }>;
    mappings?: Array<{
        path: string;
        line: number;
        romOffset: number;
        insns?: string;
    }>;
    errors?: Array<{
        line: number;
        col?: number;
        path?: string;
        message: string;
        severity: 'error' | 'warning';
    }>;
}
/** Worker encountered an internal error (not a compile error). */
export interface WorkerErrorMessage {
    type: 'error';
    id?: number;
    message: string;
}
export type OutboundMessage = ReadyMessage | CompileResultMessage | WorkerErrorMessage;
//# sourceMappingURL=protocol.d.ts.map