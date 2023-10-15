import {Component, OnInit} from '@angular/core';
import {Observable, of} from 'rxjs';

import {AngularFireAuth} from '@angular/fire/auth';
import firebase from 'firebase/app';
import {UnsubscribeOnDestroyAdapter} from '../core/unsubscribe-on-destroy-adapter';

import {AuthService} from '../core/auth.service';
import {environment} from '../../environments/environment';

import {DbSchema} from '../core/data/db-schema';
import {MatSnackBar} from '@angular/material/snack-bar';
import {SystemService} from '../core/system.service';
import {LoggerService} from '../core/logger.service';
import {AdmApp} from '../core/data/adm-app';
import {VwUser} from '../core/data/vw-user';
import {switchMap, tap} from 'rxjs/operators';
import {UserService} from '../core/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent extends UnsubscribeOnDestroyAdapter implements OnInit {
  public isProduction = environment.production;
  public whichEnv = environment.env_name;
  public appVersion = environment.APP_VERSION;
  public dataUrl = environment.DATA_URL;
  public minDBVersion = environment.DB_MIN_VERSION;

  public currentDBVersion: string = '';
  public dbSchema: DbSchema = {} as DbSchema;

  public testApp$: Observable<AdmApp> = this.systemService.getTestApp();
  public testUserList$: Observable<VwUser[]> | undefined;

  public connectionError = false;

  // public testApp: AdmApp | undefined;

  constructor(public ngAuth: AngularFireAuth, private auth: AuthService, private snack: MatSnackBar,
              private systemService: SystemService, private logger: LoggerService, public userService: UserService) {
    super();

    console.log('Login::()');

    this.subs.sink = this.systemService.getDbVersion().subscribe(db => {
        this.dbSchema = db;
        this.currentDBVersion = db.version;
      },
      err => {
        this.logger.logErrObject( 'Login()', err, 'Could not load DB version');
        this.currentDBVersion = 'unknown';
        this.connectionError = true;
      }
    );

    if (!environment.production) {
      console.log('Login::() not production');
      // this.subs.sink = this.systemService.getTestApp().subscribe(
      //   app => {
      //     console.log('Login::() called getTestApp', app);
      //     if (app && app?.idAdmApp) {
      //       this.testApp = app;
      //       this.testUserList$ = this.userService.getAppAccessUserList( app.idAdmApp ,13);
      //     } else {
      //       console.warn('Login() - no test app returned by systemService.getTestApp()');
      //     }
      //   }
      // );
      this.testUserList$ = this.testApp$.pipe(
        switchMap(testApp => {
          if (testApp && testApp.idAdmApp) {
            console.log('Login():testUserList$ - testApp', testApp);
            return this.userService.getAppAccessUserList(testApp.idAdmApp, 13);
          } else {
            console.log('Login():testUserList$ - no app');
            return of([]);
          }
        }),
        tap(userList => {
          console.log('Login::testUserList', userList);
        }, err => {
          this.logger.logErrObject('Login::testUserList$', err, 'Could not load user list');
        })
      );
    }

  }

  // could not make this work - this initial testapp$ is never called.


  ngOnInit(): void {
    // this.testApp$ = this.systemService.getTestApp();
  }

  login(): void {
    this.ngAuth.signInWithPopup(new firebase.auth.GoogleAuthProvider()).then(res =>
      console.log('Login::login - result!', res, this.ngAuth, this.ngAuth.user)
    );
  }

  logout(): void {
    this.ngAuth.signOut().then(res => {
      console.log('Login::logout() ngAuth', res);
      this.snack.open('Logged Out - go for it', '', {});
      }
    );
  }

  dbVersionColor(): string {
    if (this.connectionError || this.currentDBVersion === 'unknown') {
      return 'warn';
    }

    if (this.currentDBVersion < this.minDBVersion) {
      return 'accent';
    }
    return '';

  }


  handleTestLogin(idUser: number, email: string, idApp: number) {
    console.log('Login::handleTestLogin', idUser, email, idApp);

    if (this.isProduction) {
      console.error('Login:: this should only be called if we are in test mode');
      this.snack.open('Cannot Test Login on Production Application', 'error');
      return;
    }

    this.loginSuccess(email);

    this.subs.sink = this.auth.testLogin(idUser, idApp).subscribe(
      user => {
        if (user === null) {
          this.loginFail('Could not login');
        } else {
          this.subs.sink = this.auth.getCurrentUser$().subscribe((usr: VwUser) => {
            if (usr && (usr.idAdmUser === idUser)) {
              this.snack.open('Found User ' + email, 'info', {duration: 1000});
            }
          });

          console.log('login::handleTestLogin - check auth');

          if (!this.auth.isLoggedIn()) {
            console.warn('Login::handleTestLogin Not Logged In, Navigating to root');
            return;
          }

          this.auth.navigateHome();
        }
      }, err => {
        this.logger.logErrObject('Login::handleTestLogin', err, 'Could not login test user');
        this.loginFail('Error: ' + err.message);
      }
    );
  }


  loginFail(sFailMessage: string) {
    this.snack.open('Coud not login ' + sFailMessage, 'Login Failed', {});
    // this.showLoginErr('Couldn\'t Login #' + this.loginAttempts++, sFailMessage);
  }

  loginSuccess(sGoMessage: string) {
    this.snack.open('Logging in!', 'success', {duration: 3000});
    // this.popit('success', 'Logging In', 'Redirecting you to your dashboard, ' + sGoMessage);
  }

  // private popit(eType: string, eTitle: string, eMessage: string) {
  //   try {
  //     this.snackBar.open(eTitle + ': ' + eMessage, eType, {duration: 3000});
  //   } finally {
  //     return;
  //   }
  // }

}
