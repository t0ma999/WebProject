import type { Category, Recipe } from "./types.js";
import { isValidImageUrl } from "./recipes.js";

function requireElement<T extends HTMLElement>(selector: string): T {
    const element = document.querySelector<T>(selector);
    if (!element) {
        throw new Error(`Не найден элемент: ${selector}`);
    }
    return element;
}
export const searchInput =
    requireElement<HTMLInputElement>("#search");
export const categoryFilter =
    requireElement<HTMLSelectElement>("#category-filter");
export const favoritesOnly =
    requireElement<HTMLInputElement>("#favorites-only");
export const underThirty =
    requireElement<HTMLInputElement>("#under-thirty");
export const sortByTime =
    requireElement<HTMLSelectElement>("#sort-by-time");
export const clearFiltersButton =
    requireElement<HTMLButtonElement>("#clear-filters");
export const recipeForm =
    requireElement<HTMLFormElement>("#recipe-form");
export const recipeList =
    requireElement<HTMLDivElement>("#recipe-list");
export const formMessage =
    requireElement<HTMLParagraphElement>("#form-message");
export const resultsCount =
    requireElement<HTMLParagraphElement>("#results-count");
export const formTitle =
    requireElement<HTMLHeadingElement>("#add-title");
export const submitRecipeButton =
    requireElement<HTMLButtonElement>("#submit-recipe");
export const cancelEditButton =
    requireElement<HTMLButtonElement>("#cancel-edit");
export const recipeTitleInput =
    requireElement<HTMLInputElement>("#recipe-title");
export const recipeCategoryInput =
    requireElement<HTMLSelectElement>("#recipe-category");
export const recipeServingsInput =
    requireElement<HTMLInputElement>("#recipe-servings");
export const recipeTimeInput =
    requireElement<HTMLInputElement>("#recipe-time");
export const recipeImageUrlInput =
    requireElement<HTMLInputElement>("#recipe-image-url");
export const recipeIngredientsInput =
    requireElement<HTMLTextAreaElement>("#recipe-ingredients");
export const recipeInstructionsInput =
    requireElement<HTMLTextAreaElement>("#recipe-instructions");
const categories: Category[] = ["Завтрак", "Обед", "Ужин", "Десерт"];

export function updateCategoryCounts(recipes: Recipe[]): void {
    const totalOption = categoryFilter.options[0];
    if (totalOption) totalOption.textContent = `Все категории (${recipes.length})`;
    categories.forEach((category, index) => {
        const option = categoryFilter.options[index + 1];
        if (option) {
            const count = recipes.filter((recipe) => recipe.category === category).length;
            option.textContent = `${category} (${count})`;
        }
    });
}

export function renderRecipes(recipes: Recipe[]): void {
    const openReviewRecipeIds = new Set(
        Array.from(recipeList.querySelectorAll<HTMLDetailsElement>("details.reviews[open]"))
            .map((details) => details.dataset.recipeId)
            .filter((id): id is string => id !== undefined)
    );
    recipeList.replaceChildren();
    resultsCount.textContent = `Найдено рецептов: ${recipes.length}`;
    if (recipes.length === 0) {
        const empty = document.createElement("p");
        empty.textContent = "Ничего не найдено. Измените фильтр.";
        recipeList.append(empty);
        return;
    }
    for (const recipe of recipes) {
        const card = document.createElement("article");
        card.className = "recipe-card";
        const title = document.createElement("h3");
        title.textContent = recipe.title;
        if (recipe.imageUrl && isValidImageUrl(recipe.imageUrl)) {
            const image = document.createElement("img");
            image.className = "recipe-image";
            image.src = recipe.imageUrl;
            image.alt = recipe.title;
            image.loading = "lazy";
            card.append(image);
        }
        const content = document.createElement("div");
        content.className = "recipe-content";
        const meta = document.createElement("p");
        meta.className = "recipe-meta";
        meta.textContent =
            `${recipe.category} · ${recipe.cookingTime} мин. · ${recipe.servings} порция`;
        const ingredients = document.createElement("p");
        ingredients.textContent = `Ингредиенты: ${recipe.ingredients.join(", ")}`;
        const instructions = document.createElement("p");
        instructions.textContent = recipe.instructions;
        const recipeDetails = document.createElement("details");
        recipeDetails.className = "recipe-details";
        const recipeSummary = document.createElement("summary");
        recipeSummary.textContent = "Ингредиенты и приготовление";
        recipeDetails.append(recipeSummary, ingredients, instructions);
        const reviewsSection = document.createElement("details");
        reviewsSection.className = "reviews";
        reviewsSection.dataset.recipeId = recipe.id;
        reviewsSection.open = openReviewRecipeIds.has(recipe.id);
        const reviewsToggle = document.createElement("summary");
        reviewsToggle.textContent = `Отзывы (${recipe.reviews.length})`;
        reviewsSection.append(reviewsToggle);
        if (recipe.reviews.length === 0) {
            const emptyReviews = document.createElement("p");
            emptyReviews.textContent = "Пока нет отзывов.";
            reviewsSection.append(emptyReviews);
        } else {
            for (const review of recipe.reviews) {
                const reviewItem = document.createElement("article");
                reviewItem.className = "review";
                const author = document.createElement("strong");
                author.textContent = review.author;
                const reviewText = document.createElement("p");
                reviewText.textContent = review.text;
                const likeButton = document.createElement("button");
                likeButton.type = "button";
                likeButton.dataset.action = "review-like";
                likeButton.dataset.id = recipe.id;
                likeButton.dataset.reviewId = review.id;
                likeButton.setAttribute("aria-pressed", String(review.liked));
                likeButton.textContent = `${review.liked ? "♥" : "♡"} Нравится (${review.likes})`;
                reviewItem.append(author, reviewText, likeButton);
                reviewsSection.append(reviewItem);
            }
        }
        const reviewForm = document.createElement("form");
        reviewForm.className = "review-form";
        reviewForm.dataset.recipeId = recipe.id;
        const authorLabel = document.createElement("label");
        authorLabel.textContent = "Ваше имя";
        const authorInput = document.createElement("input");
        authorInput.name = "author";
        authorInput.required = true;
        authorInput.maxLength = 50;
        authorLabel.append(authorInput);
        const textLabel = document.createElement("label");
        textLabel.textContent = "Отзыв";
        const textInput = document.createElement("textarea");
        textInput.name = "text";
        textInput.required = true;
        textInput.maxLength = 500;
        textLabel.append(textInput);
        const submitReview = document.createElement("button");
        submitReview.type = "submit";
        submitReview.textContent = "Добавить отзыв";
        reviewForm.append(authorLabel, textLabel, submitReview);
        reviewsSection.append(reviewForm);
        const favoriteButton = document.createElement("button");
        favoriteButton.type = "button";
        favoriteButton.dataset.action = "favorite";
        favoriteButton.dataset.id = recipe.id;
        favoriteButton.textContent = recipe.favorite
            ? "★ Убрать из избранного"
            : "☆ В избранное";
        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.dataset.action = "delete";
        deleteButton.dataset.id = recipe.id;
        deleteButton.textContent = "Удалить";
        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.dataset.action = "edit";
        editButton.dataset.id = recipe.id;
        editButton.textContent = "Редактировать";
        const actions = document.createElement("div");
        actions.className = "recipe-actions";
        actions.append(favoriteButton, editButton, deleteButton);
        content.append(title, meta, recipeDetails, reviewsSection, actions);
        card.append(content);
        recipeList.append(card);
    }
}
