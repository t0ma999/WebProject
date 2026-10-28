import type { Recipe, RecipeDraft, RecipeFilter } from "./types.js";
export declare function filterRecipes(recipes: Recipe[], filter: RecipeFilter): Recipe[];
export declare function createRecipe(draft: RecipeDraft): Recipe;
export declare function toggleFavorite(recipes: Recipe[], id: string): Recipe[];
export declare function deleteRecipe(recipes: Recipe[], id: string): Recipe[];
export declare function updateRecipe(recipes: Recipe[], id: string, updates: Partial<RecipeDraft>): Recipe[];
export declare function isValidImageUrl(value: string): boolean;
export declare function addReview(recipes: Recipe[], recipeId: string, author: string, text: string): Recipe[];
export declare function toggleReviewLike(recipes: Recipe[], recipeId: string, reviewId: string): Recipe[];
//# sourceMappingURL=recipes.d.ts.map