import { type Category, type Recipe } from "./types.js";
export declare function isCategory(value: unknown): value is Category;
export declare function isNumberInRange(value: unknown, min: number, max: number): value is number;
export declare function parseRecipe(data: unknown): Recipe;
export declare function parseRecipes(data: unknown): Recipe[];
//# sourceMappingURL=parse.d.ts.map