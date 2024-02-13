# Performance improvements

1) Caching recipes from all ednpoints (assuming we have same model of recipe in all endpoints ofc). As recipes are something we don't expect to be changed (or if changed we could update their ID for example), we could cache not only recipes we're getting from `details` endpoint, but also those we are getting from `getRecentRecipes`/`searchRecipes`. It will increase our performance as for those recipes we got from `getRecentRecipes`/`searchRecipes` endpoints we could render details without fetching them once more.
Important: check logic for duplicates, we don't need to keep multiple records, we should overwrite details for recipe if there is an old entry.

2) We could cache not only recipes data, but also search results for `searchRecipes`. So we would store kez pair value: `query: recipe[]`.
Important: This cache should have some expiration time, as new recipes may be created for particular query.

3) We should not rely on `RecipeApi` instance as on cache storage, because it's just an object in runtime. We could use `localStorage` or `sessionStorage` (depending on our app business logic) to keep cache there. In this case `RecipeApi` constructor would load cache from storage (local or session), and will write it either on page close or on changes (first option is way better for performance, but there could be some tricky scenarios in IE).
I would propose to use localStorage for recipes (assuming they are unchangeable), sessionStorage for queries (ofc if business logic accepts it, as we will have same results for same query per session).

Example of saving localStorage on page close:
```
window.onunload = function () {
        localStorage.setItem("recipesCache", JSON.stringify(cache));
}
```

4) `showRecipes` method calls expensive operation `insertAdjacentHTML` for EVERY single recipe. It should generate DOM for all recipes to render and only then insert it in DOM.
Example:
```
showRecipes(recipes) {
    let recipesHTML = ""
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
```

## BONUS
We could combine endpoints `searchRecipes` and `getRecentRecipes` as second one is corner case of first one. `Limit` could be part of the query. That will optimize codebase on both sides (FE/BE).

# Bugs

1) No error and status handling in all API calls. Need to check for status (or use shorthand for succesful status `response.ok`)
Fix:
```
async getRecentRecipes() {
    try {
        const url = new URL("/api/v2/recipes/latest", window.location.origin);
        url.searchParams.set("limit", "12");
        const response = await fetch(url);
        if(!response.ok) { throw "API error" }
        return await response.json();
    } catch(e) {
        console.error("Failed to load recent recipes", e)
    }
  }
  async searchRecipes(query) {
    try {
        // Build Search URL
        const url = new URL("/api/v2/recipes", window.location.origin);
        url.searchParams.set("search", query);
        // Fetch results
        const response = await fetch(url);
        if(!response.ok) { throw "API error" }
        return await response.json();
    } catch(e) {
        console.error("Failed to load recipes", e)
    }
  }
  async getRecipeDetails(id) {
    // Check cache
    if (this.cache[id]) {
      return this.cache[id];
    }

    try {
        // Fetch from API
        const url = `/api/v2/recipes/${id}`;
        const response = await fetch(url);
        if(!response.ok) { throw "API error" }
        const json = await response.json();
        // Store to cache
        this.cache[id] = json;
        return json;
    } catch(e) {
        console.error("Failed to recipe", e)
    }
  }
```

2) Wrong usage of `new URL()` constructor. It should either be absolute path, or two arguments (relative path and base url).
Fix: `const url = new URL("/api/v2/recipes/latest", window.location.origin);`.

3) We have a `showLoader` function called, but never dismissed.
Fix: create a function `hideLoader` or extend existing function `showLoader` with boolean parameter. And invoke it after we rendered list (or whatever we needed to render).