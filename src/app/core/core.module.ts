import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {RouterModule} from '@angular/router';
import {AngularFireAuthModule} from '@angular/fire/auth';

import {MatSnackBarModule} from '@angular/material/snack-bar';
import {MatIconModule} from '@angular/material/icon';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatMenuModule} from '@angular/material/menu';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatBadgeModule} from '@angular/material/badge';

import { MenuMainComponent } from './menu-main/menu-main.component';


export type FormStatus = 'Creating' | 'Editing' | 'Deleting' | 'Empty';

@NgModule({
  declarations: [MenuMainComponent],
  imports: [
    CommonModule, AngularFireAuthModule,
    RouterModule,
    MatSnackBarModule, MatIconModule, MatTooltipModule, MatMenuModule, MatToolbarModule, MatBadgeModule
  ],
  exports: [MenuMainComponent]
})
export class CoreModule { }
