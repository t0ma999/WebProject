export interface RetryOptions {
    attempts?: number;
    delayMs?: number;
}

export function sleep(delayMs: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, delayMs));
}

export async function withRetry<T>(
    task: () => Promise<T>,
    attempts: number,
    delayMs: number
): Promise<T> {
    let lastError: unknown;
    for (let attempt = 0; attempt < attempts; attempt += 1) {
        try {
            return await task();
        } catch (error: unknown) {
            lastError = error;
            if (attempt + 1 < attempts) await sleep(delayMs);
        }
    }
    throw lastError;
}

export async function retry<T>(
    operation: () => Promise<T>,
    { attempts = 3, delayMs = 300 }: RetryOptions = {}
): Promise<T> {
    if (!Number.isInteger(attempts) || attempts < 1) {
        throw new RangeError("Количество попыток должно быть целым числом не меньше 1.");
    }
    if (!Number.isFinite(delayMs) || delayMs < 0) {
        throw new RangeError("Задержка должна быть неотрицательным числом.");
    }

    for (let attempt = 1; ; attempt += 1) {
        try {
            return await operation();
        } catch (error: unknown) {
            if (attempt === attempts) throw error;
            await new Promise<void>((resolve) => setTimeout(resolve, delayMs));
        }
    }
}
