import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {TemplateCrudComponent} from './template-crud/template-crud.component';

const routes: Routes = [{path: '', component: TemplateCrudComponent}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TemplateRoutingModule { }
