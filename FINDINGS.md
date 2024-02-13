# Task 1 issues and improvements:

1) Validation of data for recipe is separated from Recipe class. So class instance itself could be created with undefined data, which makes no sense.

Proposal: put validation logic inside Recipe class constructor.

2) Recipe class has no toJSON() implementation, and in some places JSON.stringify is used on it's instance. That may be an issue in future when class will be extended with some new fields/functionality.

Proposal: add toJSON method to class, describing how it should be formed in JSON format.

3) Validation implementation is not optimized. Three different conditions lead to same handling.

Proposal: combine three conditions to single one.
Additionally: discuss with business what validation rules they would like to have for recipe fields and implement a normal validation.

4) Race condition between script and render. We are searching for form DOM element in our script without waiting for the page to load.
In case when script is added in HTML before markup with form it won't work.

Proposal: run logic related to finding form DOM and putting event listeners on it AFTER page load.
To achieve this we could use any of possible render checks:
- window.addEventListener("DOMContentLoaded", ...) / document.addEventListener("DOMContentLoaded", ...)
- window.onload / document.onload
Window one waiting for all resources to load, document one waits only for initial HTML to render. Also window one will be executed AFTER all the document handlers.
So if you sure your form is there on initial load (e.g. form is in page HTML, no runtime rendering inside etc.) - document one will execute faster. Otherwise (or if you doubt) use window one.

5) Submit handler doesn't prevent default browser handler for form submitting, it would lead us to page reload on every form submitting, which we obviously don"t need, as we handle submit logic on client (FE) side, and just invoking some POST endpoint manually.

Proposal: We could simply use "e.preventDefault()" at the start of our function (as it have couple of exits it's better to call it before).

6) Getting form data by named elements is not reliable way to get form values, because it goes through all form elements (input, label, button etc.) 
  and in case of your field name is same as dom element type (e.g. label) it will break.

Proposal: use FormData class and it's methods.
  Example:
  const data = new FormData(form)
  data.get("title")

7) No status check of response in API call method. If fetch has not throw an error it doesn't yet mean it was successful, as 4xx and 5xx responses are not network errors they are not throwing exceptions.
  
  
Proposal: I would suggest to either check for response status codes (if you know what code means what from API), or use "response.ok" check as generic way.
  Example:
    if (response.ok) {
        return response.json();
    }
    throw new Error('Failed to save recipe');

## Bonus:
Split logic for ingredients is currently part of submit handler, while logically should be in class implementation (depends on other cases of class usage, but I would say)