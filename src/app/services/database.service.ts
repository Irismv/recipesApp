import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { Ingredient, Recipe } from '../recipes/recipes.page';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  private _storage: Storage | null = null;

  constructor(private storage: Storage) {
    this.init();
  }

  async init() {
    const storage = await this.storage.create();
    this._storage = storage;
  }
  async addRecipe(name: string, ingredients: Ingredient[], cookingTime: number) {
    const recipes: Recipe[] = (await this._storage?.get('recipes')) || [];
    recipes.push({ name, ingredients, cookingTime });
    await this._storage?.set('recipes', recipes);
  }

  async getAllRecipes() {
    return (await this._storage?.get('recipes')) || []; // Lege array als er geen recepten zijn
  }
  async setAllRecipes(recipes: Recipe[]) {
    await this._storage?.set('recipes', recipes);
  }

  async getRandomRecipes(count: number) {
    const recipes = (await this.getAllRecipes()) || [];
    return recipes.sort(() => 0.5 - Math.random()).slice(0, count);
  }
}
