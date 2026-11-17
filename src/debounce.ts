export function debounce<TArgs extends unknown[]>(
    callback: (...args: TArgs) => void,
    delayMs = 300
): (...args: TArgs) => void {
    if (!Number.isFinite(delayMs) || delayMs < 0) {
        throw new RangeError("Задержка должна быть неотрицательным числом.");
    }

    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    return (...args: TArgs): void => {
        if (timeoutId !== undefined) clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            timeoutId = undefined;
            callback(...args);
        }, delayMs);
    };
}
