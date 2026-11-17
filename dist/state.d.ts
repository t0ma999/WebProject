import type { Recipe } from "./types.js";
export type LoadState = {
    status: "loading";
} | {
    status: "error";
    message: string;
} | {
    status: "success";
    recipes: Recipe[];
};
export declare function assertNever(value: never): never;
export declare function errorMessage(error: unknown): string;
//# sourceMappingURL=state.d.ts.map