import { CATEGORIES, type Category, type Recipe, type Review } from "./types.js";

export function isCategory(value: unknown): value is Category {
    return typeof value === "string" &&
        CATEGORIES.some((category) => category === value);
}

export function isNumberInRange(
    value: unknown,
    min: number,
    max: number
): value is number {
    return typeof value === "number" &&
        Number.isFinite(value) &&
        value >= min &&
        value <= max;
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

type StoredRecipe = Omit<Recipe, "id" | "reviews"> & {
    id: string | number;
    reviews?: Review[];
};

function isRecipe(value: unknown): value is StoredRecipe {
    if (typeof value !== "object" || value === null) return false;
    const item = value as Record<string, unknown>;
    return (
        (typeof item.id === "string" || typeof item.id === "number") &&
        typeof item.title === "string" &&
        item.title.trim().length > 0 &&
        isCategory(item.category) &&
        isNumberInRange(item.servings, 1, 30) &&
        isNumberInRange(item.cookingTime, 1, 600) &&
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

export function parseRecipe(data: unknown): Recipe {
    if (!isRecipe(data)) {
        throw new Error("Сервер вернул данные неожиданного формата");
    }
    return {
        ...data,
        id: String(data.id),
        reviews: data.reviews ?? []
    };
}

export function parseRecipes(data: unknown): Recipe[] {
    if(!Array.isArray(data) || !data.every(isRecipe)){
        throw new Error("Сервер вернул данные неожиданного формата");
    }
    return data.map(parseRecipe);
}
