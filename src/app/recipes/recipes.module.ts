import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Routes } from '@angular/router';
import { RecipesPage } from './recipes.page';

const routes: Routes = [
  { path: '', component: RecipesPage }, // Route voor deze pagina
];

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, RouterModule.forChild(routes)],
  declarations: [RecipesPage],
})
export class RecipesPageModule {}
