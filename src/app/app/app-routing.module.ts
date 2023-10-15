import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppCrudComponent } from './app-crud/app-crud.component';

const routes: Routes = [{path: '', component: AppCrudComponent}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
