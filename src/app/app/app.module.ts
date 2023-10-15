import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppCrudComponent } from './app-crud/app-crud.component';
import { AppRoutingModule } from './app-routing.module';
import { CoreModule } from '../core/core.module';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatListModule } from '@angular/material/list';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonToggleModule } from '@angular/material/button-toggle';

@NgModule({
  declarations: [AppCrudComponent],
  imports: [
    CommonModule,
    AppRoutingModule,
    CoreModule,
    FormsModule, ReactiveFormsModule, MatFormFieldModule, MatSelectModule, MatInputModule,
    MatTooltipModule, MatListModule, MatIconModule, MatButtonModule, MatCardModule, MatSnackBarModule,
    MatButtonToggleModule
  ]
})
export class AppModule { }
