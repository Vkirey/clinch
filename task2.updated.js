// Recipe API client
class RecipeApi {
  constructor() {
    this.cache = {
      recipes: JSON.parse(localStorage.getItem("recipes") ?? "{}"),
      queries: JSON.parse(sessionStorage.getItem("queries") ?? "{}"),
    };

    window.onunload = function () {
      localStorage.setItem("recipes", JSON.stringify(this.cache.recipes));
      sessionStorage.setItem("queries", JSON.stringify(this.cache.queries));
    }.bind(this);
  }
  async getRecentRecipes() {
    try {
      const url = new URL("/api/v2/recipes/latest", window.location.origin);
      url.searchParams.set("limit", "12");
      const response = await fetch(url);
      if(!response.ok) { throw "API error" }
      const recipes = await response.json();
      recipes.forEach((r) => (this.cache.recipes[r.id] = r));
      return recipes;
    } catch (e) {
      console.error("Failed to load recent recipes", e);
    }
  }
  async searchRecipes(query) {
    if(this.cache.queries[query]) {
      return this.cache.queries[query]
    }

    try {
      // Build Search URL
      const url = new URL("/api/v2/recipes", window.location.origin);
      url.searchParams.set("search", query);
      // Fetch results
      const response = await fetch(url);
      if (!response.ok) {
        throw "API error";
      }
      const recipes = await response.json();
      recipes.forEach((r) => (this.cache.recipes[r.id] = r));
      this.cache.queries[query] = recipes;
      return recipes;
    } catch (e) {
      console.error("Failed to load recipes", e);
    }
  }
  async getRecipeDetails(id) {
    // Check cache
    if (this.cache.recipes[id]) {
      return this.cache.recipes[id];
    }

    try {
      // Fetch from API
      const url = `/api/v2/recipes/${id}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw "API error";
      }
      const json = await response.json();
      // Store to cache
      this.cache.recipes[id] = json;
      return json;
    } catch (e) {
      console.error("Failed to recipe", e);
    }
  }
}
// UI Rendering
class RecipeRenderer {
  constructor() {
    this.recipesElement = document.getElementById("recipe-list");
  }
  showRecipes(recipes) {
    let recipesHTML = "";
    recipes.forEach((recipe) => {
      recipesHTML += `
          <div class="recipe">
            <h2>${recipe.name}</h2>
            <p>${recipe.description}</p>
         </div>
        `;
    });
    this.recipesElement.insertAdjacentHTML("beforeend", recipesHTML);
  }
  showLoader() {
    // TODO
  }
  hideLoader() {
    // TODO
  }
  showError() {
    // TODO
  }
}
// Bring it together
window.addEventListener("DOMContentLoaded", () => {
  const api = new RecipeApi();
  const renderer = new RecipeRenderer();
  async function loadRecipes() {
    try {
      renderer.showLoader();
      const recipes = await api.getRecentRecipes();

      renderer.showRecipes(recipes);
      renderer.hideLoader();
    } catch (err) {
      renderer.showError();
    }
  }
  loadRecipes();
});
