import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {LoginComponent} from './login/login.component';
import {HomeComponent} from './home/home/home.component';
import {AdminGuard} from './core/admin.guard';

const routes: Routes = [
  {path: 'login', component: LoginComponent },
  {path: '',  redirectTo: '/login', pathMatch: 'full' },
  {path: 'home', component: HomeComponent, canActivate: [AdminGuard]},
  {path: 'template/:idAdmApp', loadChildren: () => import('./template/template.module').then(m => m.TemplateModule),
    canActivate: [AdminGuard] },
  {path: 'template', loadChildren: () => import('./template/template.module').then(m => m.TemplateModule), canActivate: [AdminGuard] },
  {path: 'apps', loadChildren: () => import('./app/app.module').then(m => m.AppModule), canActivate: [AdminGuard] },
  {path: 'user', loadChildren: () => import('./template/template.module').then(m => m.TemplateModule), canActivate: [AdminGuard] },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

