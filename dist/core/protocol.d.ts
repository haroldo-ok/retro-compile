import type { Platform, Language } from '../types.js';
export interface PreloadMessage {
    type: 'preload';
    fs: string;
    baseUrl: string;
    vendorUrl: string;
}
export interface CompileMessage {
    type: 'compile';
    id: number;
    platform: Platform;
    language: Language;
    source: string;
    files: Record<string, string | Uint8Array>;
    debug: boolean;
    /** Base URL for Wasm binaries and FS packs (dist/assets/). */
    baseUrl: string;
    /** URL for the vendor engine bundle (dist/vendor/). */
    vendorUrl: string;
}
export interface ResetMessage {
    type: 'reset';
}
export type InboundMessage = PreloadMessage | CompileMessage | ResetMessage;
export interface ReadyMessage {
    type: 'ready';
}
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
export interface WorkerErrorMessage {
    type: 'error';
    id?: number;
    message: string;
}
export type OutboundMessage = ReadyMessage | CompileResultMessage | WorkerErrorMessage;
//# sourceMappingURL=protocol.d.ts.map