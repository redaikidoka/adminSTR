import {Injectable, NgZone} from '@angular/core';
import {Router} from '@angular/router';
import {catchError, concatMap, map, tap} from 'rxjs/operators';
import {UnsubscribeOnDestroyAdapter} from './unsubscribe-on-destroy-adapter';
import {Observable, BehaviorSubject, Subject, ReplaySubject, of} from 'rxjs';
import {Apollo} from 'apollo-angular';
import firebase from 'firebase';
import UserInfo = firebase.UserInfo;
import User = firebase.User;
import {AngularFireAuth} from '@angular/fire/auth';
import gql from 'graphql-tag';

// @ts-ignore
import * as cloneDeep from 'lodash/cloneDeep';

import {MatSnackBar} from '@angular/material/snack-bar';

import {VwUser} from './data/vw-user';
import {AdmApp, AdmFramework} from './data/adm-app';
import {qAppsFull} from './data/q-apps';
import {qSchema} from './data/q-schemas';

import {environment} from '../../environments/environment';
// import {auth, User, UserInfo} from '../../../node_modules/firebase';

import {UserService} from './user.service';
import {LoggerService} from './logger.service';



export interface AuthStateModel {
  user: Partial<UserInfo>;
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService extends UnsubscribeOnDestroyAdapter {

  private currentUser$: BehaviorSubject<VwUser> = new BehaviorSubject<VwUser>({} as VwUser);
  private currentApp$: BehaviorSubject<AdmApp> = new BehaviorSubject<AdmApp>({} as AdmApp);

  private authInfo: AuthStateModel;
  private testToken = '2021-02-23test';

  private loggedIn = false;

  getCurrentUser$(): Observable<VwUser> {
    return this.currentUser$.asObservable();
  }

  getCurrentApp$(): Observable<AdmApp> {
    return this.currentApp$.asObservable();
  }

  getCurrentApp(): AdmApp {
    return this.currentApp$.getValue() ?? {} as AdmApp;
  }

  getCurrentUser(): VwUser {
    if (this.currentUser$.getValue()) {
      return this.currentUser$.getValue();
    }

    return {} as VwUser;
  }

  me(): VwUser {
    return this.getCurrentUser();
  }

  getAppId(): number {
    if (this.currentApp$.getValue()) {
      return this.currentApp$.getValue().idAdmApp;
    }
    return -1;
  }

  myId(): number {
    return this.me()?.idAdmUser;
  }

  constructor(public ngAuth: AngularFireAuth, private apollo: Apollo,
              private snackBar: MatSnackBar, private userService: UserService, private logger: LoggerService,
              private zone: NgZone, private router: Router) {
    super();

    this.authInfo = {} as AuthStateModel;

    this.ngAuth.onAuthStateChanged( (fUser) => {
      // console.log('AuthState::onAuthStateChanged', fUser);
      console.log('AuthState::onAuthStateChanged', fUser?.email);

      if (fUser) {
        fUser.getIdToken().then((token: string) => {
          // console.log('AuthState::AUTH TOKEN', token);
          // console.log('AuthState::CURRENT USER', fUser);
          const saveMe = {displayName: fUser.displayName, email: fUser.email};
          this.authInfo = {user: saveMe, token};
          this.subs.sink = this.loginUserEmail(fUser.email || '', token).subscribe(user => {
            if (user.idAdmUser) {
              // we got a user! Login!
            } else {
              // nope. We out.
              this.authInfo = {} as AuthStateModel;
              this.snackBar.open('Could not login', 'Failed');
            }
          });
          // store.dispatch(new LoginSuccesfulAction({user: saveMe, token}));
        });
      } else {
        if (this.validTestLogin()) {
          console.warn('AuthState::onAuthStateChanged validTestLogin');
          const me = this.getCurrentUser();
          const saveMe = {displayName: me.userName, email: me.userEmail};
          const token: string = this.authInfo.token || '';
          this.authInfo = {user: saveMe, token};

        } else {
          this.logout();
        }
      }
    });
  }

  recordLogin(loginInfo: string, userId: number, user: VwUser): void {
    return this.logger.makeLog('Login', loginInfo);
  }

  recordLogout(user: VwUser): void {
    return this.logger.makeLog('Logout', 'User logged out');
  }


  logout(navigate: boolean = true): void {
    console.log('AuthService::logout()');
    this.snackBar.open('Logging out...', '', {duration: 500});

    this.recordLogout(this.getCurrentUser());

    this.ngAuth.signOut()
      .then(() => {
        this.loggedIn = false;
        this.authInfo = {} as AuthStateModel;
        this.currentUser$.next({} as VwUser);

        localStorage.removeItem(environment.APP_NAME + 'Token', );
        localStorage.removeItem(environment.APP_NAME + 'User');
        localStorage.removeItem(environment.APP_NAME + 'Server');

        if (navigate) {
          console.log('AuthService::logout - navigating home');
          this.navigateHome();
        }
      })
      .catch((error: any) => {
        this.logger.logErrObject('AuthService::logout', error, 'Could not logout');
        this.snackBar.open('Could not logout', '', {duration: 3000});
        return;
      });
  }


  navigateHome(): void {
    // console.log('AuthService::navigateHome');
    if (!this.loggedIn) {
      console.error('AuthService::navigateHome Not Logged In, Navigating to login');
      this.zone.run(() => {
        this.router.navigate(['/login']);
      });
      return;
    }
    this.zone.run(() => {
      this.router
        .navigate(['/home'])
        .then((e: any) => {
          console.log('authService::navigateHome()::goForIt to /home  for ', this.getCurrentUser(), 'info:', e);

          if (e === false) {
            this.logger.logErr('Login', 'Could not login to dashboard:', 'Could not login');
          }
        })
        .catch((reason: any) => {
          console.error(
            'authService::navigateHome() failed to nav reason:',
            reason
          );
          // this.showLoginErr( 'Could not navigate to your dashboard', 'The error is: ' + reason);

          this.logger.logErrObject( 'Login::goForIt', reason, 'Could not navigate to dashboard :(' );
        });
    });
  }


  testLogin(idUser: number, idApp: number): Observable<VwUser> {
    if (this.isLoggedIn()) {
      console.log('AuthService::testLogin - logging out ', this.me());
      this.logout(false);
    }

    return this.userService.getUser(idUser, idApp).pipe(
      map((found) => {
        console.log('AuthService::testLogin(): LOADED test USER', found);
        this.currentUser$.next(found);
        this.authInfo = {user: {displayName: found.userName, email: found.userEmail}, token: this.testToken};
        // this.authInfo.token = this.testToken;


        return found;
      }),
      concatMap(() => this.loginUser(this.me())),
      catchError((err) => {
        this.logger.logErrObject('AuthService::testLogin', err, 'Could not login user id ' + idUser);
        return of({} as VwUser);
      })
    );

  }


  loginUser(user: VwUser): Observable<VwUser> {
    // console.log("AuthService::loginUser", user);

    this.loggedIn = true;

    if (!this.authInfo.token) {
      this.logger.logErr('loginUser', 'no login token', 'Could not get Login Token');
      return of({} as VwUser);
    }

    this.saveUser(user);

    this.recordLogin(user.userName + ' user login succeeded from ' +
      environment.DATA_URL + ' ' + environment.env_name,
      user.idAdmUser, user
    );

    return this.getCurrentUser$();
  }


  loginUserEmail(email: string, token: string): Observable<VwUser> {
    console.log('AuthService::loginUserEmail ', email);

    if ( this.isLoggedIn() ) {
      console.log('Auth::loginEmail Logged in test user!');
      this.logout(false);
    }

    return this.userService.getUserByEmail(email).pipe(
      concatMap((found: VwUser[]) => {
        if (found && found.length > 0) {
          const me = found[0];
          console.log('AUthService::loginEmail working', found);
          this.authInfo = {user: {displayName: me.userName, email: me.userEmail}, token: this.testToken};
          return this.loginUser(me);
        } else {
          this.logger.logErr( 'AuthService::loginEmail', 'Could not login ' + email, 'Could not login!' );
          this.logger.makeLog('LoginUserEMail', email + ' LOGIN FAILED');
          this.logout();
          return of({} as VwUser);
        }
      }),
      catchError((err) => {
        this.logger.logErrObject( 'AuthService::loginEmail', err, 'Could not login this email ' + email );

        this.logout();
        return of({} as VwUser);
      })
    );
  }

  checkSavedUser(): boolean {
    const token = localStorage.getItem(environment.APP_NAME + 'Token');
    const savedUser = localStorage.getItem(environment.APP_NAME + 'User');
    const dataUrl = localStorage.getItem(environment.APP_NAME + 'Server');

    if (token && savedUser && dataUrl === environment.DATA_URL) {
      console.log( 'AuthService::checkSavedUser - user exists!', token, 'user: ', savedUser );
      const convertedUser = JSON.parse(savedUser) as VwUser;

      return true;
    } else {
      // console.log('could not login saved user ', savedUser, token, ' at ', serverurl);
      return false;
    }
  }

  saveUser(user: VwUser): void {
    console.log('Auth::saveUser', user);
    this.currentUser$.next(user);
    this.logger.currentUser$.next(user);

    try {
      localStorage.setItem(environment.APP_NAME + 'Token', this.authInfo?.token);
      localStorage.setItem(environment.APP_NAME + 'User', JSON.stringify(user));
      localStorage.setItem(environment.APP_NAME + 'Server', environment.DATA_URL);
    } catch (err) {
      this.logger.logErrObject('AuthService::saveUser', err, 'User Information could not be saved to the browser.' );
    }
  }


  validTestLogin(): boolean {
    return (
      this.loggedIn && this.getCurrentUser() && this.authInfo?.token === this.testToken
    );
  }

  isLoggedIn(): boolean {
    return this.loggedIn && this.getCurrentUser() && (typeof this.authInfo?.token === 'string'); // && this.authInfo?.user?.email;
  }

  isSysAdmin(): boolean {
    return this.isLoggedIn() && this.me().idUserType === 13;
  }

  isProduction(): boolean {
    return environment.production;
  }



}
