export function filterRecipes(recipes, filter) {
    const query = filter.query.trim().toLowerCase();
    const filtered = recipes.filter((recipe) => {
        const matchesQuery = recipe.title.toLowerCase().includes(query);
        const matchesCategory = filter.category === "Все" || recipe.category === filter.category;
        const matchesFavorite = !filter.favoritesOnly || recipe.favorite;
        const matchesTime = !filter.underThirtyMinutes || recipe.cookingTime <= 30;
        return matchesQuery && matchesCategory && matchesFavorite && matchesTime;
    });
    if (filter.sortByTime === "none")
        return filtered;
    const direction = filter.sortByTime === "asc" ? 1 : -1;
    return filtered.sort((first, second) => direction * (first.cookingTime - second.cookingTime));
}
export function createRecipe(draft) {
    return {
        ...draft,
        id: crypto.randomUUID(),
        favorite: false,
        reviews: []
    };
}
export function toggleFavorite(recipes, id) {
    return recipes.map((recipe) => recipe.id === id
        ? { ...recipe, favorite: !recipe.favorite }
        : recipe);
}
export function deleteRecipe(recipes, id) {
    return recipes.filter((recipe) => recipe.id !== id);
}
export function updateRecipe(recipes, id, updates) {
    return recipes.map((recipe) => recipe.id === id ? { ...recipe, ...updates } : recipe);
}
export function isValidImageUrl(value) {
    try {
        const url = new URL(value);
        return url.protocol === "http:" || url.protocol === "https:";
    }
    catch {
        return false;
    }
}
export function addReview(recipes, recipeId, author, text) {
    const review = {
        id: crypto.randomUUID(),
        author,
        text,
        likes: 0,
        liked: false
    };
    return recipes.map((recipe) => recipe.id === recipeId
        ? { ...recipe, reviews: [...recipe.reviews, review] }
        : recipe);
}
export function toggleReviewLike(recipes, recipeId, reviewId) {
    return recipes.map((recipe) => recipe.id !== recipeId
        ? recipe
        : {
            ...recipe,
            reviews: recipe.reviews.map((review) => {
                if (review.id !== reviewId)
                    return review;
                const liked = !review.liked;
                return {
                    ...review,
                    liked,
                    likes: review.likes + (liked ? 1 : -1)
                };
            })
        });
}
//# sourceMappingURL=recipes.js.map