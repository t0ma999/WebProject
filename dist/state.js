export function assertNever(value) {
    throw new Error(`Необработанное состояние: ${JSON.stringify(value)}`);
}
export function errorMessage(error) {
    return error instanceof Error ? error.message : "Неизвестная ошибка";
}
//# sourceMappingURL=state.js.map