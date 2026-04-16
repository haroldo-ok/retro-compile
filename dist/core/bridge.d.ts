import type { CompileOptions, CompileResult } from '../types.js';
export declare class WorkerBridge {
    private worker;
    private ready;
    private pending;
    private nextId;
    private baseUrl;
    private vendorUrl;
    private constructor();
    static create(workerUrl: string, baseUrl: string, vendorUrl: string): WorkerBridge;
    precompile(platform: import('../types.js').Platform): void;
    compile(opts: CompileOptions): Promise<CompileResult>;
    terminate(): void;
    private handleMessage;
}
//# sourceMappingURL=bridge.d.ts.map