/*
In current implementation this class doesn't do much, except setting 3 fields.
We could add validation here instead of keeping it separate.

Also we could add method toJSON() to generate JSON with only required fields of the class when somebody uses JSON.stringify() on it, 
because default implementation simply uses all public fields of class, 
which would work in this particular example, but overall will create potential bugs when somebody will extend class with additional logic.
*/

// Recipe model
class Recipe {
  constructor(title, ingredients, instructions) {
    this.title = title;
    this.ingredients = ingredients;
    this.instructions = instructions;
  }
}

/*
This validation does only check if values are defined and not null.
In current implementation it makes no sense to have 3 different condition with same result, so it could be like:
if (!title || !ingridients || instructions) { return false }

But it also makes sense to move validation logic to Recipe class constructor. 
As currently we separate it for no reason, and we could create a Recipe with undefined values, which makes no sense.

P.S. I would say we might want to have more precise validation here (e.g. ingridients and instructions must include letters), but it's business rules to discuss.
*/
// Input validation
function validateInputs(title, ingredients, instructions) {
  if (!title) {
    return false;
  }
  if (!ingredients) {
    return false;
  }
  if (!instructions) {
    return false;
  }
  return true;
}

/* 
We should be sure that next scripts are running after page rendered and form is there.
To achieve this we could use any of possible render checks:
- window.addEventListener("DOMContentLoaded", ...) / document.addEventListener("DOMContentLoaded", ...)
- window.onload / document.onload
Window one waiting for all resources to load, document one waits only for initial HTML to render. Also window one will be executed AFTER all the document handlers.
So if you sure your form is there on initial load (e.g. form is in page HTML, no runtime rendering inside etc.) - document one will execute faster. Otherwise (or if you doubt) use window one.
*/
const form = document.getElementById("recipe-form");

/*
As we handle submit logic on client (FE) side, and just invoking some POST endpoint manually - we may want to prevent browser form submitting logic here.
To ahieve this we could simply use "e.preventDefault()" at the start of our function (as it have couple of exits it's better to call it before).
*/
form.addEventListener("submit", (e) => {
  // Get data
  /*
  Getting data by names in elements array is not a good way to do this. Because it goes through all form elements (input, label, button etc.) 
  and in case of your field name is same as dom element type (e.g. label) it will break.

  I would propose to use FormData class and it's methods.
  Example:
  const data = new FormData(form)
  data.get("title")
  */
  const title = form.elements["title"].value;
  const ingredients = form.elements["ingredients"].value.split(","); // We could move logic for ingredients string splitting in constructor
  const instructions = form.elements["instructions"].value;
  // Validate
  if (!validateInputs(title, ingredients, instructions)) { // move validation to class constructor
    alert("Invalid recipe data");
    return;
  }
  // Create recipe object
  const recipe = new Recipe(title, ingredients, instructions);
  
  saveRecipe(recipe)
    .then((res) => {
      console.log("Recipe saved!", res);
    })
    .catch((err) => {
      console.error("Save failed!", err);
    });
});

/* 
  No status check of response. 
  If fetch has not throw an error it doesn't yet mean it was successful, as 4xx and 5xx responses are not network errors they are not throwing exceptions.
  I would suggest to either check for response status codes (if you know what code means what from API), or use "response.ok" check as generic way.
  Example:
    if (response.ok) {
        return response.json();
    }
    throw new Error('Failed to save recipe');
  */
async function saveRecipe(recipe) {
  const resp = await fetch("/api/recipes", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(recipe),
  });
  return resp.json();
}
