const recipeForm = document.getElementById('recipe-form');
const recipeList = document.getElementById('recipe-list');
const noRecipes = document.getElementById('no-recipes');
const searchBox = document.getElementById('search-box');

let recipes = JSON.parse(localStorage.getItem('recipes')) || [];

// Function to render recipes
function renderRecipes() {
    recipeList.innerHTML = '';
    if (recipes.length === 0) {
        noRecipes.style.display = 'block';
    } else {
        noRecipes.style.display = 'none';
        recipes.forEach((recipe, index) => {
            const recipeItem = document.createElement('div');
            recipeItem.className = 'recipe-item';
            recipeItem.innerHTML = `
                <h4>${recipe.name}</h4>
                <img src="${recipe.image}" alt="${recipe.name}" width="100">
                <p><strong>Ingredients:</strong> ${recipe.ingredients}</p>
                <p><strong>Method:</strong> ${recipe.method}</p>
                <button onclick="editRecipe(${index})">Edit</button>
                <button onclick="deleteRecipe(${index})">Delete</button>
            `;
            recipeList.appendChild(recipeItem);
        });
    }
}

// Function to add a recipe
recipeForm.addEventListener('submit', function (event) {
    event.preventDefault();
    const recipeName = document.getElementById('recipe-name').value;
    const recipeIngredients = document.getElementById('recipe-ingredients').value;
    const recipeMethod = document.getElementById('recipe-method').value;
    const recipeImage = document.getElementById('recipe-image').files[0];

    const reader = new FileReader();
    reader.onload = function (e) {
        const newRecipe = {
            name: recipeName,
            ingredients: recipeIngredients,
            method: recipeMethod,
            image: e.target.result
        };
        recipes.push(newRecipe);
        localStorage.setItem('recipes', JSON.stringify(recipes));
        renderRecipes();
        recipeForm.reset();
    };
    reader.readAsDataURL(recipeImage);
});

// Function to edit a recipe
function editRecipe(index) {
    const recipe = recipes[index];
    document.getElementById('recipe-name').value = recipe.name;
    document.getElementById('recipe-ingredients').value = recipe.ingredients;
    document.getElementById('recipe-method').value = recipe.method;
    // You can handle image preview separately if needed
    deleteRecipe(index); // Remove the recipe for now; you can choose to edit it directly instead
}

// Function to delete a recipe
function deleteRecipe(index) {
    recipes.splice(index, 1);
    localStorage.setItem('recipes', JSON.stringify(recipes));
    renderRecipes();
}

// Search functionality
searchBox.addEventListener('input', function () {
    const searchTerm = searchBox.value.toLowerCase();
    const filteredRecipes = recipes.filter(recipe => recipe.name.toLowerCase().includes(searchTerm));
    recipeList.innerHTML = '';
    filteredRecipes.forEach((recipe, index) => {
        const recipeItem = document.createElement('div');
        recipeItem.className = 'recipe-item';
        recipeItem.innerHTML = `
            <h4>${recipe.name}</h4>
            <img src="${recipe.image}" alt="${recipe.name}" width="100">
            <p><strong>Ingredients:</strong> ${recipe.ingredients}</p>
            <p><strong>Method:</strong> ${recipe.method}</p>
            <button onclick="editRecipe(${index})">Edit</button>
            <button onclick="deleteRecipe(${index})">Delete</button>
        `;
        recipeList.appendChild(recipeItem);
    });
});

// Initial rendering
renderRecipes();
