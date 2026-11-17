export interface RetryOptions {
    attempts?: number;
    delayMs?: number;
}
export declare function sleep(delayMs: number): Promise<void>;
export declare function withRetry<T>(task: () => Promise<T>, attempts: number, delayMs: number): Promise<T>;
export declare function retry<T>(operation: () => Promise<T>, { attempts, delayMs }?: RetryOptions): Promise<T>;
//# sourceMappingURL=retry.d.ts.map