// Recipe model
class Recipe {
  constructor(title, ingredients, instructions) {
    if (!title || !ingredients || !instructions) {
      throw "Invalid recipe data";
    }
    this.title = title;
    this.ingredients = ingredients.split(",");
    this.instructions = instructions;
  }


  toJSON() {
    return {
        title: this.title,
        ingredients: this.ingredients,
        instructions: this.instructions
    }
  }
}

window.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("recipe-form");

  form.addEventListener("submit", (e) => {
    e.preventDefault()
    // Get data
    const data = new FormData(form)
    const title = data.get("title");
    const ingredients = data.get("ingredients");
    const instructions = data.get("instructions");
    
    // Create recipe object
    let recipe
    try {
      recipe = new Recipe(title, ingredients, instructions);
    } catch(err) {
      alert(err);
    }

    saveRecipe(recipe)
    // POST to API
    saveRecipe(recipe)
      .then((res) => {
        console.log("Recipe saved!", res);
      })
      .catch((err) => {
        console.error("Save failed!", err);
      });
  
  });
  // API post handler
  async function saveRecipe(recipe) {
    const resp = await fetch("/api/recipes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(recipe),
    });
    if(resp.ok) {
      return resp.json();
    } else {
      throw "Failed to save recipe"
    }
  }
})