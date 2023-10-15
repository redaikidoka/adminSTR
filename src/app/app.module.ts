import {ErrorHandler, NgModule} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {InMemoryCache} from '@apollo/client/core';
import {HttpClientModule} from '@angular/common/http';
import {APOLLO_OPTIONS} from 'apollo-angular';
import {HttpLink} from 'apollo-angular/http';
import { GraphQLModule } from './graphql.module';

import {CommonModule} from '@angular/common';
import {CoreModule} from './core/core.module';
import {LoginModule} from './login/login.module';

import { AngularFireModule } from '@angular/fire';
import {AngularFireAuthModule} from '@angular/fire/auth';

import { environment } from '../environments/environment';
import {RollbarErrorHandlerService, rollbarFactory, RollbarService} from './core/rollbar-error-handler.service';

import {MatSnackBarModule} from '@angular/material/snack-bar';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatCardModule} from '@angular/material/card';
import {MatListModule} from '@angular/material/list';
import {MatChipsModule} from '@angular/material/chips';
import {MatIconModule} from '@angular/material/icon';
import {HomeModule} from './home/home.module';
import {MatButtonModule} from '@angular/material/button';


@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule, CommonModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    GraphQLModule,
    HttpClientModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAuthModule,
    MatSnackBarModule, CoreModule, LoginModule, HomeModule,
    MatTooltipModule, MatCardModule, MatListModule, MatChipsModule
    , MatIconModule, MatTooltipModule, MatSnackBarModule, MatButtonModule
  ],
  exports: [],
  providers: [
    {
      provide: APOLLO_OPTIONS,
      useFactory: (httpLink: HttpLink) => {
        return {
          cache: new InMemoryCache(),
          link: httpLink.create({ uri: environment.DATA_URL, }),
        };
      },
      deps: [HttpLink],
    },
    { provide: ErrorHandler, useClass: RollbarErrorHandlerService },
    { provide: RollbarService, useFactory: rollbarFactory },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
