export function debounce(callback, delayMs = 300) {
    if (!Number.isFinite(delayMs) || delayMs < 0) {
        throw new RangeError("Задержка должна быть неотрицательным числом.");
    }
    let timeoutId;
    return (...args) => {
        if (timeoutId !== undefined)
            clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            timeoutId = undefined;
            callback(...args);
        }, delayMs);
    };
}
//# sourceMappingURL=debounce.js.map