import type { NewRecipe, Recipe } from "./types.js";
export declare function fetchRecipes(query?: string, signal?: AbortSignal): Promise<Recipe[]>;
export declare function createRecipeOnServer(recipe: NewRecipe): Promise<Recipe>;
export declare function setFavorite(id: string, favorite: boolean): Promise<Recipe>;
export declare function updateRecipeOnServer(id: string, updates: Partial<NewRecipe>): Promise<Recipe>;
export declare function deleteRecipeFromServer(id: string): Promise<void>;
//# sourceMappingURL=api.d.ts.map