import { Component, OnInit } from '@angular/core';
import { DatabaseService } from '../services/database.service';

export interface Recipe {
  name: string;
  ingredients: Ingredient[];
  cookingTime: number;
}

export interface Ingredient {
  name: string;
  quantity: number;
  unit: string;
}

@Component({
  selector: 'app-recipes',
  templateUrl: './recipes.page.html',
  standalone: false,
  styleUrls: ['./recipes.page.scss'],
})
export class RecipesPage implements OnInit {

  recipes: Recipe[] = [];
  weekPlan: Recipe[] = [];
  ingredientInput: string = '';
  ingredientUnit: string = '';
ingredientQuantity: number = 1;
  newRecipe: Recipe = { name: '', ingredients: [], cookingTime: 0 };
  shoppingList: { name: string, quantity: number, unit: string }[] = [];
  sortBy: string = 'cookingTime';
  constructor(private db: DatabaseService) {}

  async ngOnInit() {
    // Haal recepten meteen op bij het laden van de pagina
    this.recipes = await this.db.getAllRecipes();
    this.sortRecipes(); // Sorteer recepten meteen
  }

   // Genereer de boodschappenlijst op basis van het weekschema
   generateShoppingList() {
    const ingredientsMap = new Map<string, { quantity: number, unit: string }>();

    this.weekPlan.forEach(recipe => {
      console.log("Recept:", recipe.name, "Ingrediënten:", recipe.ingredients);

      // Controleer of ingredients een string is en converteer naar array
      if (recipe.ingredients && typeof recipe.ingredients === 'string') {
        recipe.ingredients = (recipe.ingredients as string).split(',').map((ing: string) => ({
          name: ing.trim(),
          quantity: 1,
          unit: ''
        }));
      }

      // Controleer opnieuw of het nu een array is
      if (!Array.isArray(recipe.ingredients)) {
        console.error("Fout: recipe.ingredients is nog steeds geen array!", recipe.ingredients);
        return; // Stop deze iteratie
      }

      recipe.ingredients.forEach(ingredient => {
        console.log("Ingredient:", ingredient);
        const existing = ingredientsMap.get(ingredient.name);
        if (existing) {
          existing.quantity += ingredient.quantity;
        } else {
          ingredientsMap.set(ingredient.name, { quantity: ingredient.quantity, unit: ingredient.unit });
        }
      });
    });

    this.shoppingList = Array.from(ingredientsMap.entries()).map(([name, { quantity, unit }]) => ({ name, quantity, unit }));
    console.log("Boodschappenlijst:", this.shoppingList);
  }

  addIngredient() {
    if (this.ingredientInput.trim()) {
      this.newRecipe.ingredients.push({
        name: this.ingredientInput.trim(),
        quantity: this.ingredientQuantity,
        unit: this.ingredientUnit.trim()
      });

      // Velden leegmaken na toevoegen
      this.ingredientInput = '';
      this.ingredientQuantity = 1;
      this.ingredientUnit = '';
    }
  }

  async addRecipe() {
    if (this.newRecipe.name && this.newRecipe.ingredients.length > 0 && this.newRecipe.cookingTime) {
      // Voeg het recept toe met de ingrediënten die al in de newRecipe zitten
      await this.db.addRecipe(this.newRecipe.name, this.newRecipe.ingredients, this.newRecipe.cookingTime);

      // Herlaad de receptenlijst
      this.recipes = await this.db.getAllRecipes();

      // Reset het formulier
      this.newRecipe = { name: '', ingredients: [], cookingTime: 0 };
      this.ingredientInput = ''; // Reset de ingredientInput
      this.sortRecipes(); // Her-sorteren na toevoegen van een nieuw recept
    } else {
      alert("Vul alle velden in!");
    }
  }


  async removeRecipe(index: number) {
    // Haal de huidige recepten op
    const recipes = await this.db.getAllRecipes();
    // Verwijder het recept op de opgegeven index
    recipes.splice(index, 1);
    // Sla de nieuwe lijst op in de storage
    await this.db.setAllRecipes(recipes);
    // Herlaad de receptenlijst
    this.recipes = recipes;
  }

  editRecipe(index: number) {
    const recipe = this.recipes[index];
    this.newRecipe = { ...recipe };  // Vul het formulier met de geselecteerde receptdata
    this.removeRecipe(index);  // Verwijder het oude recept, en voeg het nieuwe toe na bewerken
  }

  sortByCookingTime() {
    this.recipes.sort((a, b) => a.cookingTime - b.cookingTime);
  }

  sortRecipes() {
    if (this.sortBy === 'cookingTime') {
      this.recipes.sort((a, b) => a.cookingTime - b.cookingTime);
    } else if (this.sortBy === 'ingredients') {
      this.recipes.sort((a, b) => a.ingredients.length - b.ingredients.length);
    }
  }

   // Functie voor het wijzigen van de sorteermethode
   changeSortOrder(sortOption: string) {
    this.sortBy = sortOption;
    this.sortRecipes(); // Her-sorteren van recepten
  }

  async generateWeekPlan() {
    this.weekPlan = [...this.recipes] // Kopie maken
      .sort((a, b) => a.cookingTime - b.cookingTime) // Kortste kooktijd eerst
      .slice(0, 7); // Neem 7 recepten
  }

  sortWeekPlan() {
    if (this.sortBy === 'cookingTime') {
      this.weekPlan.sort((a, b) => a.cookingTime - b.cookingTime);
    } else if (this.sortBy === 'ingredients') {
      this.weekPlan.sort((a, b) => a.ingredients.length - b.ingredients.length);
    }
  }
}
