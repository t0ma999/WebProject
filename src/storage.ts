import type { Category, Recipe, Review } from "./types.js";
const STORAGE_KEY = "culinary-recipes";

function isCategory(value: unknown): value is Category {
    return value === "Завтрак" || value === "Обед" ||
        value === "Ужин" || value === "Десерт";
}

function isReview(value: unknown): value is Review {
    if (typeof value !== "object" || value === null) return false;
    const review = value as Record<string, unknown>;
    return (
        typeof review.id === "string" &&
        typeof review.author === "string" &&
        review.author.trim().length > 0 &&
        typeof review.text === "string" &&
        review.text.trim().length > 0 &&
        typeof review.likes === "number" &&
        Number.isInteger(review.likes) &&
        review.likes >= 0 &&
        typeof review.liked === "boolean"
    );
}

type StoredRecipe = Omit<Recipe, "reviews"> & { reviews?: Review[] };

function isRecipe(value: unknown): value is StoredRecipe {
    if (typeof value !== "object" || value === null) return false;
    const item = value as Record<string, unknown>;
    return (
        typeof item.id === "string" &&
        typeof item.title === "string" &&
        item.title.trim().length > 0 &&
        isCategory(item.category) &&
        typeof item.servings === "number" &&
        Number.isFinite(item.servings) &&
        item.servings >= 1 &&
        item.servings <= 30 &&
        typeof item.cookingTime === "number" &&
        Number.isFinite(item.cookingTime) &&
        item.cookingTime >= 1 &&
        item.cookingTime <= 600 &&
        (item.imageUrl === undefined || typeof item.imageUrl === "string") &&
        Array.isArray(item.ingredients) &&
        item.ingredients.every((x: unknown) => typeof x === "string") &&
        typeof item.instructions === "string" &&
        item.instructions.trim().length > 0 &&
        typeof item.favorite === "boolean" &&
        (item.reviews === undefined ||
            (Array.isArray(item.reviews) && item.reviews.every(isReview)))
    );
}
export function loadRecipes(): Recipe[] | null {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return null;
    try {
        const parsed: unknown = JSON.parse(raw);
        if (!Array.isArray(parsed) || !parsed.every(isRecipe)) {
            return null;
        }
        return parsed.map((recipe): Recipe => ({
            ...recipe,
            reviews: recipe.reviews ?? []
        }));
    } catch {
        return null;
    }
}
export function saveRecipes(recipes: Recipe[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(recipes));
}
