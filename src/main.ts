import type { Recipe, RecipeDraft, RecipeFilter } from "./types.js";
import { isCategory } from "./parse.js";
import { debounce } from "./debounce.js";
import {
    addReview, deleteRecipe, filterRecipes, toggleFavorite,
    toggleReviewLike, updateRecipe, isValidImageUrl
} from "./recipes.js";
import {
    searchInput, categoryFilter, favoritesOnly, underThirty, sortByTime,
    clearFiltersButton, recipeForm, recipeList, formMessage, formTitle,
    submitRecipeButton, cancelEditButton, recipeTitleInput, recipeCategoryInput,
    recipeServingsInput, recipeTimeInput, recipeImageUrlInput,
    recipeIngredientsInput, recipeInstructionsInput, updateCategoryCounts,
    renderRecipes, renderMessage, retryButton
} from "./ui.js";
import { assertNever, errorMessage, type LoadState } from "./state.js";
import {
    createRecipeOnServer, deleteRecipeFromServer, fetchRecipes,
    setFavorite, updateRecipeOnServer
} from "./api.js";
import { withRetry } from "./retry.js";

let editingRecipeId: string | null = null;
let state: LoadState = { status: "loading" };

function getFilter(): RecipeFilter {
    return {
        query: searchInput.value,
        category: categoryFilter.value === "Все"
            ? "Все"
            : isCategory(categoryFilter.value)
                ? categoryFilter.value
                : "Все",
        favoritesOnly: favoritesOnly.checked,
        underThirtyMinutes: underThirty.checked,
        sortByTime: sortByTime.value as RecipeFilter["sortByTime"]
    };
}

function render(): void {
    retryButton.hidden = state.status !== "error";
    switch (state.status) {
        case "loading":
            renderMessage("Загружаем рецепты...");
            break;
        case "error":
            renderMessage(`Не удалось загрузить: ${state.message}`);
            break;
        case "success":
            updateCategoryCounts(state.recipes);
            renderRecipes(filterRecipes(state.recipes, getFilter()));
            break;
        default:
            assertNever(state);
    }
}

function setState(next: LoadState): void {
    state = next;
    render();
}

function updateRecipes(update: (recipes: Recipe[]) => Recipe[]): void {
    if (state.status !== "success") return;
    setState({ status: "success", recipes: update(state.recipes) });
}

let searchController: AbortController | undefined;
async function search(): Promise<void> {
    searchController?.abort();
    searchController = new AbortController();
    try {
        const recipes = await fetchRecipes(searchInput.value, searchController.signal);
        setState({ status: "success", recipes });
    } catch (error: unknown) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setState({ status: "error", message: errorMessage(error) });
    }
}

searchInput.addEventListener("input", debounce(() => void search(), 300));
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
    void search();
});
retryButton.addEventListener("click", () => void init());

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
        void (async () => {
            if (state.status !== "success") return;
            const recipes = toggleReviewLike(state.recipes, id, reviewId);
            const recipe = recipes.find((item) => item.id === id);
            if (!recipe) return;
            try {
                await updateRecipeOnServer(id, { reviews: recipe.reviews });
                updateRecipes(() => recipes);
            } catch (error: unknown) {
                formMessage.textContent = errorMessage(error);
            }
        })();
    } else if (action === "favorite") {
        void (async () => {
            if (state.status !== "success") return;
            const recipe = state.recipes.find((item) => item.id === id);
            if (!recipe) return;
            try {
                await setFavorite(id, !recipe.favorite);
                updateRecipes((recipes) => toggleFavorite(recipes, id));
            } catch (error: unknown) {
                formMessage.textContent = errorMessage(error);
            }
        })();
    } else if (action === "delete") {
        if (!window.confirm("Удалить этот рецепт?")) return;
        void (async () => {
            try {
                await deleteRecipeFromServer(id);
                updateRecipes((recipes) => deleteRecipe(recipes, id));
                if (editingRecipeId === id) stopEditing();
            } catch (error: unknown) {
                formMessage.textContent = errorMessage(error);
            }
        })();
    } else if (action === "edit") {
        if (state.status !== "success") return;
        const recipe = state.recipes.find((item) => item.id === id);
        if (!recipe) return;
        startEditing(recipe);
    }
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
    void (async () => {
        if (state.status !== "success") return;
        const recipes = addReview(state.recipes, recipeId, author, text);
        const recipe = recipes.find((item) => item.id === recipeId);
        if (!recipe) return;
        try {
            await updateRecipeOnServer(recipeId, { reviews: recipe.reviews });
            updateRecipes(() => recipes);
        } catch (error: unknown) {
            formMessage.textContent = errorMessage(error);
        }
    })();
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
    if (!isCategory(recipeCategoryInput.value)) {
        formMessage.textContent = "Выберите категорию из списка.";
        return;
    }
    const draft: RecipeDraft = {
        title,
        category: recipeCategoryInput.value,
        servings,
        cookingTime,
        imageUrl,
        ingredients,
        instructions
    };
    if (editingRecipeId) {
        const id = editingRecipeId;
        void (async () => {
            try {
                const recipe = await updateRecipeOnServer(id, draft);
                updateRecipes((recipes) => updateRecipe(recipes, id, recipe));
                stopEditing();
                formMessage.textContent = "Изменения сохранены.";
            } catch (error: unknown) {
                formMessage.textContent = errorMessage(error);
            }
        })();
    } else {
        void (async () => {
            try {
                const recipe = await createRecipeOnServer({
                    ...draft,
                    favorite: false,
                    reviews: []
                });
                updateRecipes((recipes) => [recipe, ...recipes]);
                recipeForm.reset();
                formMessage.textContent = "Рецепт добавлен.";
            } catch (error: unknown) {
                formMessage.textContent = errorMessage(error);
            }
        })();
    }
});

async function init(): Promise<void> {
    setState({ status: "loading" });
    try {
        const recipes = await withRetry(() => fetchRecipes(), 3, 1000);
        setState({ status: "success", recipes });
    } catch (error: unknown) {
        setState({ status: "error", message: errorMessage(error) });
    }
}

void init();
