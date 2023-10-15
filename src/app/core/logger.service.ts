import {Inject, Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';

import {RollbarService} from './rollbar-error-handler.service';
import Rollbar from 'rollbar';

import gql from 'graphql-tag';
import {Apollo} from 'apollo-angular';
import {map, tap} from 'rxjs/operators';

import {UnsubscribeOnDestroyAdapter} from './unsubscribe-on-destroy-adapter';

import {MatSnackBar} from '@angular/material/snack-bar';

import {VwUser} from './data/vw-user';

import {environment} from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class LoggerService extends UnsubscribeOnDestroyAdapter {

  currentUser$: BehaviorSubject<VwUser> = new BehaviorSubject<VwUser>({} as VwUser);

  private me(): VwUser {
    return this.currentUser$.getValue();
  }
  constructor(@Inject(RollbarService) private rollbar: Rollbar, private apollo: Apollo, private snackBar: MatSnackBar) {
    super();
  }

  makeLog(area: string, logText: string): void {

    const qLog = gql` mutation MyMutation {
        __typename
        createSLog(
          input: {
            sLog: {
              app: "webSTR"
              appVersion: "${environment.APP_VERSION}"
              area: "${area}"
              isComplete: true
              logText: "${logText}"
              sCreateUser: ${this.me()?.idAdmUser ?? null}
            }
          }
        )
        { clientMutationId }
      } `;

    // //////////////////////////////
    // rollbar

    try {
      // this.setUserPayload(usr);
      // this.rollBar.info(area + '::' + logText);
      this.rollbar.info('v' + environment.APP_VERSION + ' [' + area + '] \t' + logText + '\n');
    } catch (err) {
      console.error('LoggerService::makeLog - Could not make log to rollbar', err);
    }

    // log in application
    this.subs.sink = this.apollo.mutate({mutation: qLog}).pipe(
      tap(result => console.log('LoggerService::MakeLog() Logged!', result),
        err => this.logErrObject('LoggerService::MakeLog()', err, 'Could not make log ' + logText)
      )
    ).subscribe(res => console.log('makeLog result', res));


  }

  logErrObject( area: string, err: Error, userText: string): void {

    this.logErr(area, err ? err.message : userText, userText);
  }

  // PS 2019-12-06 12:09:13 : actually write the error!
  logErr( area: string, errText: string, userText: string): void {
    console.error( area, ': ', errText, '\n', userText);

    const app = (this.me()?.idAdmApp) ?? '';
    const createUser = (this.me()?.idAdmUser) ?? '';


    const qNewError = gql`mutation NewError {
      __typename
      createSErr(input: {sErr: {area: "${area}",
        errorText: "${errText}"
        ${ app } ${createUser}
         }}) {
        clientMutationId
      }
    }`;

    this.snackBar.open(userText, 'Error', {duration: 2500});
    try {
      this.writeRollbarErrorText(area, errText, userText);
    } catch (e) {
      console.error('LoggerService::LogErr could not log Rollbar Error', e);
    }

    this.subs.sink = this.apollo.mutate<any>({mutation: qNewError}).pipe(
      tap(res => console.warn('LoggerService::logErr ', res, qNewError),
        err => {
          window.alert('Logger::logErr could NOT log  database error: \n' + err);
          console.error('Logger::logErr could NOT log database error', err);
        })
    ).subscribe(res => console.log('logErr result', res),
    err => console.error('LoggerService::logErr error logging database error', err));

  }

  private writeRollbarErrorText(area: string, errText: string, userText: string): void {
    const userInfo = (this.me()?.idAdmUser > 0 ? ('\nUSER ' + this.me().idAdmUser + ' ' + this.me().userName) : '\n:::NO USER INFO:::\n');

    if (!environment.production) {
      console.log('writeRollbarErrorText::Error Not logged to rollbar in non-production environment');
      return;
    }
    try {
      this.rollbar.error(area + '\nERR:\n' + errText + '\nMESSAGE:\n' + userText + userInfo);
    } catch (err) {
      console.error('Could not log error text to Rollbar', err);
    }
  }

}
