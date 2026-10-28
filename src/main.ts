import type { Category, Recipe, RecipeDraft, RecipeFilter } from "./types.js";
import { initialRecipes } from "./data.js";
import { loadRecipes, saveRecipes } from "./storage.js";
import {
    addReview, createRecipe, deleteRecipe, filterRecipes, toggleFavorite,
    toggleReviewLike, updateRecipe, isValidImageUrl
} from "./recipes.js";
import {
    searchInput, categoryFilter, favoritesOnly, underThirty, sortByTime,
    clearFiltersButton, recipeForm, recipeList, formMessage, formTitle,
    submitRecipeButton, cancelEditButton, recipeTitleInput, recipeCategoryInput,
    recipeServingsInput, recipeTimeInput, recipeImageUrlInput,
    recipeIngredientsInput, recipeInstructionsInput, updateCategoryCounts,
    renderRecipes
} from "./ui.js";
let recipes: Recipe[] = loadRecipes() ?? initialRecipes;
let editingRecipeId: string | null = null;
function getFilter(): RecipeFilter {
    return {
        query: searchInput.value,
        category: categoryFilter.value as Category | "Все",
        favoritesOnly: favoritesOnly.checked,
        underThirtyMinutes: underThirty.checked,
        sortByTime: sortByTime.value as RecipeFilter["sortByTime"]
    };
}
function render(): void {
    updateCategoryCounts(recipes);
    renderRecipes(filterRecipes(recipes, getFilter()));
}
function persistAndRender(): void {
    saveRecipes(recipes);
    render();
}
searchInput.addEventListener("input", render);
categoryFilter.addEventListener("change", render);
favoritesOnly.addEventListener("change", render);
underThirty.addEventListener("change", render);
sortByTime.addEventListener("change", render);
clearFiltersButton.addEventListener("click", () => {
    searchInput.value = "";
    categoryFilter.value = "Все";
    favoritesOnly.checked = false;
    underThirty.checked = false;
    sortByTime.value = "none";
    render();
});
function stopEditing(): void {
    editingRecipeId = null;
    recipeForm.reset();
    formTitle.textContent = "Добавить рецепт";
    submitRecipeButton.textContent = "Сохранить рецепт";
    cancelEditButton.hidden = true;
    formMessage.textContent = "";
}
function startEditing(recipe: Recipe): void {
    editingRecipeId = recipe.id;
    recipeTitleInput.value = recipe.title;
    recipeCategoryInput.value = recipe.category;
    recipeServingsInput.value = String(recipe.servings);
    recipeTimeInput.value = String(recipe.cookingTime);
    recipeImageUrlInput.value = recipe.imageUrl ?? "";
    recipeIngredientsInput.value = recipe.ingredients.join(", ");
    recipeInstructionsInput.value = recipe.instructions;
    formTitle.textContent = "Редактировать рецепт";
    submitRecipeButton.textContent = "Сохранить изменения";
    cancelEditButton.hidden = false;
    formMessage.textContent = "";
    recipeForm.scrollIntoView({ behavior: "smooth", block: "start" });
}
cancelEditButton.addEventListener("click", stopEditing);
recipeList.addEventListener("click", (event: MouseEvent) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const button = target.closest<HTMLButtonElement>("button[data-action]");
    if (!button) return;
    const id = button.dataset.id;
    const action = button.dataset.action;
    if (!id) return;
    if (action === "review-like") {
        const reviewId = button.dataset.reviewId;
        if (!reviewId) return;
        recipes = toggleReviewLike(recipes, id, reviewId);
    } else if (action === "favorite") {
        recipes = toggleFavorite(recipes, id);
    } else if (action === "delete") {
        if (!window.confirm("Удалить этот рецепт?")) return;
        recipes = deleteRecipe(recipes, id);
        if (editingRecipeId === id) stopEditing();
    } else if (action === "edit") {
        const recipe = recipes.find((item) => item.id === id);
        if (!recipe) return;
        startEditing(recipe);
        return;
    } else {
        return;
    }
    persistAndRender();
});
recipeList.addEventListener("submit", (event: SubmitEvent) => {
    const target = event.target;
    if (!(target instanceof HTMLFormElement) ||
        !target.matches("form.review-form")) return;
    event.preventDefault();
    const recipeId = target.dataset.recipeId;
    const formData = new FormData(target);
    const authorValue = formData.get("author");
    const textValue = formData.get("text");
    if (!recipeId || typeof authorValue !== "string" ||
        typeof textValue !== "string") return;
    const author = authorValue.trim();
    const text = textValue.trim();
    if (!author || !text) return;
    recipes = addReview(recipes, recipeId, author, text);
    persistAndRender();
});
recipeForm.addEventListener("submit", (event: SubmitEvent) => {
    event.preventDefault();
    const title = recipeTitleInput.value.trim();
    const servings = Number(recipeServingsInput.value);
    const cookingTime = Number(recipeTimeInput.value);
    const ingredients = recipeIngredientsInput.value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    const instructions = recipeInstructionsInput.value.trim();
    const imageUrl = recipeImageUrlInput.value.trim();
    if (!title || !instructions || ingredients.length === 0) {
        formMessage.textContent = "Заполните все поля формы.";
        return;
    }
    if (!Number.isFinite(servings) || servings < 1 || servings > 30) {
        formMessage.textContent = "Количество порций должно быть от 1 до 30.";
        return;
    }
    if (!Number.isFinite(cookingTime) || cookingTime < 1 || cookingTime > 600) {
        formMessage.textContent = "Время должно быть от 1 до 600 минут.";
        return;
    }
    if (imageUrl && !isValidImageUrl(imageUrl)) {
        formMessage.textContent = "Укажите корректную ссылку на изображение (http или https).";
        return;
    }
    const draft: RecipeDraft = {
        title,
        category: recipeCategoryInput.value as Category,
        servings,
        cookingTime,
        imageUrl,
        ingredients,
        instructions
    };
    if (editingRecipeId) {
        recipes = updateRecipe(recipes, editingRecipeId, draft);
        stopEditing();
        formMessage.textContent = "Изменения сохранены.";
    } else {
        recipes = [createRecipe(draft), ...recipes];
        recipeForm.reset();
        formMessage.textContent = "Рецепт добавлен.";
    }
    persistAndRender();
});
render();
