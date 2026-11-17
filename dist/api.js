import { parseRecipe, parseRecipes } from "./parse.js";
const API_URL = "http://127.0.0.1:3003/recipes";
async function request(url, init = {}) {
    const response = await fetch(url, init);
    if (!response.ok) {
        throw new Error(`Сервер вернул ошибку: ${response.status}`);
    }
    if (response.status === 204)
        return null;
    const text = await response.text();
    if (!text)
        return null;
    return JSON.parse(text);
}
export async function fetchRecipes(query = "", signal) {
    const url = query.trim()
        ? `${API_URL}?title_like=${encodeURIComponent(query.trim())}`
        : API_URL;
    const data = await request(url, signal ? { signal } : {});
    return parseRecipes(data);
}
export async function createRecipeOnServer(recipe) {
    const data = await request(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(recipe)
    });
    return parseRecipe(data);
}
export async function setFavorite(id, favorite) {
    const data = await request(`${API_URL}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ favorite })
    });
    return parseRecipe(data);
}
export async function updateRecipeOnServer(id, updates) {
    const data = await request(`${API_URL}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates)
    });
    return parseRecipe(data);
}
export async function deleteRecipeFromServer(id) {
    await request(`${API_URL}/${id}`, { method: "DELETE" });
}
//# sourceMappingURL=api.js.map