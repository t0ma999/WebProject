export function sleep(delayMs) {
    return new Promise((resolve) => setTimeout(resolve, delayMs));
}
export async function withRetry(task, attempts, delayMs) {
    let lastError;
    for (let attempt = 0; attempt < attempts; attempt += 1) {
        try {
            return await task();
        }
        catch (error) {
            lastError = error;
            if (attempt + 1 < attempts)
                await sleep(delayMs);
        }
    }
    throw lastError;
}
export async function retry(operation, { attempts = 3, delayMs = 300 } = {}) {
    if (!Number.isInteger(attempts) || attempts < 1) {
        throw new RangeError("Количество попыток должно быть целым числом не меньше 1.");
    }
    if (!Number.isFinite(delayMs) || delayMs < 0) {
        throw new RangeError("Задержка должна быть неотрицательным числом.");
    }
    for (let attempt = 1;; attempt += 1) {
        try {
            return await operation();
        }
        catch (error) {
            if (attempt === attempts)
                throw error;
            await new Promise((resolve) => setTimeout(resolve, delayMs));
        }
    }
}
//# sourceMappingURL=retry.js.map