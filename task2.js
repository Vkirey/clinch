// Recipe API client
class RecipeApi {
  constructor() {
    this.cache = {}; // should sync with localStorage (or sessionStorage), runtime class instance field can't be used as source of truth
  }
  async getRecentRecipes() {
    // Build URL with filters
    const url = new URL("/api/v2/recipes/latest"); // Won't work, it should either be absolute path, or two arguments (relative path and base url)
    url.searchParams.set("limit", "12");
    // Fetch
    const response = await fetch(url); // No status check and error handling
    return await response.json(); // Save each recipe in response to cache
  }
  async searchRecipes(query) {
    // Build Search URL
    const url = new URL("/api/v2/recipes"); // Won't work, it should either be absolute path, or two arguments (relative path and base url)
    url.searchParams.set("search", query);
    // Fetch results
    const response = await fetch(url); // No status check and error handling
    return response.json(); // Save response for the query in cache, save each recipe in response to cache as well
  }
  async getRecipeDetails(id) {
    // Check cache
    if (this.cache[id]) {
      return this.cache[id];
    }
    // Fetch from API
    const url = `/api/v2/recipes/${id}`;
    const response = await fetch(url); // No status check and error handling
    const json = await response.json();
    // Store to cache
    this.cache[id] = json;
    return json;
  }
}
// UI Rendering
class RecipeRenderer {
  constructor() {
    this.recipesElement = document.getElementById("recipe-list");
  }
  showRecipes(recipes) {
    recipes.forEach((recipe) => {
      const recipeHTML = `
          <div class="recipe">
            <h2>${recipe.name}</h2>
            <p>${recipe.description}</p>
         </div>
  `;
      this.recipesElement.insertAdjacentHTML("beforeend", recipeHTML); // Expensive operation should be invoked once all recipes DOM are merged, not on every recipe
    });
  }
  showLoader() {
    // TODO
  }
  showError() {
    // TODO
  }
}
// Bring it together
const api = new RecipeApi();
const renderer = new RecipeRenderer(); // Instance creation should be called on DOM load as it uses getElementById inside
async function loadRecipes() {
  try {
    renderer.showLoader();
    const recipes = await api.getRecentRecipes();

    renderer.showRecipes(recipes);
    // renderer.hideLoader();
  } catch (err) {
    renderer.showError();
  }
}
loadRecipes();
