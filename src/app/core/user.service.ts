import {Observable, of} from 'rxjs';
import {Injectable} from '@angular/core';

import {Apollo} from 'apollo-angular';
import gql from 'graphql-tag';
import {map, tap, catchError} from 'rxjs/operators';

import {AdmApp} from './data/adm-app';
import {VwUser} from './data/vw-user';
import {qVwUserActive, usrFields} from './data/q-user';

// import {UsrNotify} from './data/UsrNotify';
import {LoggerService} from './logger.service';

import {UnsubscribeOnDestroyAdapter} from './unsubscribe-on-destroy-adapter';

@Injectable({
  providedIn: 'root'
})
export class UserService extends UnsubscribeOnDestroyAdapter {

  me: VwUser | null;
  app: AdmApp | null;

  static getInitials(userName: string): string {
    if (!userName) {
      return '';
    }

    return userName.trim().split(' ').reduce((acc, cur, idx, arr) => acc +
      (arr.length > 1 ? (idx === 0 || idx === arr.length - 1 ? cur.substring(0, 1) : '') : cur.substring(0, 2)), '').toUpperCase();
  }

  static dataToVwUserQuery(loadedUser: any, queryName: string): VwUser {
    // console.log('UserService::datatoVwUser', loadedUser);
    return loadedUser.data[queryName];
    // if (usr) {
    //   return usr;
    // } else {
    //   console.warn('UserService::dataToVwUser - dis data bad');
    //   // @ts-ignore
    //   return ();
    // }
  }


  static dataToVwUsers(loadedUsers: any): VwUser[] {
    return loadedUsers.data.allVwUsersList;
    // if (users && users.nodes.length > 0) {
    //   return users.nodes as VwUser[];
    // } else {
    //   console.warn('UserService::dataToVwUsers - dis data bad');
    //   return ([]);
    // }
  }

  // static dataToUsrNotify(notifies: any): UsrNotify[] {
  //   const n = notifies.data.allUsrNotifies.nodes;
  //   if (n && n.length > 0) {
  //     return <UsrNotify[]>n;
  //   }
  // }


  // subUser: Subscription;
  // notifications: BehaviorSubject<UsrNotify[] | null> = new BehaviorSubject<UsrNotify[]>(null);


  constructor(private apollo: Apollo, private logger: LoggerService) {
    super();

    this.me = null;
    this.app = null;
  }

  setUser(user: VwUser): void {
    this.me = user;
    // this.idUserNotifications = this.me.idAdmUser;
  }

  setApp(app: AdmApp): void {
    this.app = app;
    // this.loadNotify(true);

  }


  getUser(idUser: number, idAdmApp: number): Observable<VwUser> {
    const qSingleUser = gql`{ vwUserByIdAdmUserAndIdAdmApp( idAdmUser: ${idUser}, idAdmApp: ${idAdmApp}) {
        ${usrFields}
      } }`;

    console.log('UserService::getuser', idUser, idAdmApp, qSingleUser);
    // return new Observable((observer: Observer<VwUser>) => {
    return this.apollo.query<any>({query: qSingleUser}).pipe(
      tap(usr => console.log('UserService::getUser', usr),
        err => this.logger.logErrObject( 'UserService::getUser', err, 'Could not load user')),
      map(userData => UserService.dataToVwUserQuery(userData, 'vwUserByIdAdmUserAndIdAdmApp'))
    );

  }

  getUserByEmail(email: string): Observable<VwUser[]> {
    const qSingleUser = gql`{ allVwUsersList(condition: {userEmail: "${email}"}) {
        ${usrFields}
      }  }`;

    console.log('UserService::getUserByEmail', email, qSingleUser);
    // return new Observable((observer: Observer<VwUser>) => {
    return this.apollo.query<any>({query: qSingleUser}).pipe(
      map(userData => UserService.dataToVwUsers(userData))
    );

  }

  getUserList(): Observable<VwUser[]> {
    console.log('UserService::getUserList', qVwUserActive);

    return this.apollo.query<any>({query: qVwUserActive}).pipe(
      tap(res => console.log('UserService::getUserList', res),
        err =>
          this.logger.logErrObject( 'UserService::getUserList()', err, 'Could not load user list')),
      map(userData => UserService.dataToVwUsers(userData))
    );
  }

  getAppUserList(idApp: number): Observable<VwUser[]> {
    // console.log('UserService::getUserList', qVwUserAll);
    const qAppUsers = gql`
      {
        allVwUsersList(condition: {isActive: true, idAdmApp: ${idApp} } , orderBy: USER_NAME_ASC) {
          ${usrFields}
        }
      } `;


    console.log('UserService::getAppUserList', idApp, qAppUsers);

    return this.apollo.query<any>({query: qAppUsers}).pipe(
      tap(res => console.log('UserService::getUserList', res),
        err =>
          this.logger.logErrObject( 'UserService::getUserList()', err, 'Could not load user list')),
      map(userData => userData.data.allVwUsersList )
    );
  }


  getAppAccessUserList(idApp: number, accessLevel: number): Observable<VwUser[]> {

    const qAppUsers = gql`
      {
        allVwUsersList(condition: {isActive: true, idAdmApp: ${idApp}, idUserType: ${accessLevel} } , orderBy: USER_NAME_ASC) {
          ${usrFields}
        }
      } `;

    console.log('UserService::getAppAccessUserList', idApp, accessLevel, qAppUsers);

    return this.apollo.query<any>({query: qAppUsers}).pipe(
      tap(res => console.log('UserService::getUserList', res),
        err =>
          this.logger.logErrObject( 'UserService::getUserList()', err, 'Could not load user list')),
      map(userData => userData.data.allVwUsersList )
    );
  }
  // loadNotify(force: boolean = false): Observable<UsrNotify[] > | null {
  //
  //   console.assert(this.me, 'UserService::loadNotify(): I should have a user' );
  //
  //   if (!this.me || !this.me.idAdmUser) {
  //     return null;
  //   }
  //
  //   if (!force && this.idUserNotifications === this.me.idAdmUser) {
  //     return null;
  //   }
  //
  //   return this.getUserNotify(this.me.idAdmUser).pipe(
  //     map(notifies => {
  //         this.notifications.next(notifies);
  //         this.idUserNotifications = this.me.idAdmUser;
  //       }
  //     )
  //   );
  //
  // }

  // private getUserNotify(idUser: number) {
  //   const qUsrNotify = gql`{
  //     allUsrNotifies(orderBy: S_CREATE_DESC, first:10, condition: {idAdmUser: ${idUser}, idAdmApp: ${this.app.idAdmApp} }) {
  //       nodes {
  //         idAdmUser
  //         idNotify
  //         isRead
  //         linkedId
  //         linkedObject
  //         linkedUser
  //         message
  //         readReceipt
  //         sCreate
  //         sUpdate
  //         idAdmApp
  //       }
  //     }
  //   } `;
  //
  //   // console.log('Userz::getusernotify', idUser, qUsrNotify);
  //
  //   return this.apollo.query<any>({query: qUsrNotify}).pipe(
  //     map(notifications => UserService.dataToUsrNotify(notifications)),
  //     catchError(err => {
  //         this.logger.logErrObject(this.me, 'UserService::getUserNotify', err, 'Could not load notifications');
  //         return throwError(err);
  //       }
  //     )
  //   );
  //
  // }

  // readAllNotifications(idUser: number, idApp: number) {
  //
  //   // const found = this.notifications.getValue().find(n => n.idNotify === idNotify);
  //   // console.log('UserService::readNotification ', found);
  //   // const found = (findMe && findMe.length > 0) ? findMe[0] : null;
  //   // const readReceipt = found ? found.readReceipt : false;
  //   const qUpdate = gql`mutation {
  //     readAllNotifies(input: {iduser: ${idUser}, idapp: ${idApp}}) {
  //       clientMutationId
  //     }
  //   }
  //   `;
  //
  //
  //   console.log('UZerz::readAllNotifications', idUser, qUpdate);
  //
  //   return this.apollo.mutate<any>({mutation: qUpdate}).pipe(
  //     tap(response => console.log('UZerz::readAllNotifications Marked Read', response)),
  //     map(res =>  this.loadNotify(true) )
  //   );
  //
  // }

  // makeNotify(idUser: number, message: string,
  //            linkedObject: number, linkedId: number, linkedIdUser: number) {
  //
  //   const qMakeNotify = gql`mutation {
  //     createUsrNotify(input: {usrNotify:
  //     {idAdmUser: ${idUser},
  //       message: \"${message}\",
  //       linkedUser: ${linkedIdUser},
  //       linkedObject: ${linkedObject},
  //       linkedId: ${linkedId},
  //       idAdmApp: ${this.app.idAdmApp},
  //       sCreateUser: ${this.me.idAdmUser}
  //     }
  //     }) {
  //       clientMutationId
  //       __typename
  //       usrNotify {
  //         idAdmApp
  //         idAdmUser
  //         idNotify
  //         isRead
  //         linkedId
  //         linkedObject
  //         linkedUser
  //         message
  //         nodeId
  //         readReceipt
  //       }
  //     }
  //   }`;
  //
  //   console.log('UZerz::makeNotify', idUser, message, linkedObject, linkedId, linkedIdUser);
  //
  //   return this.apollo.mutate<any>({mutation: qMakeNotify}).pipe(
  //     tap(response => console.log('UserService::made the Notify', response),
  //       err => this.logger.logErrObject(this.me, 'userService::MakeNotify', err,
  //         'Could not make the notification for ' + idUser + ' ' + message + ' ' + linkedObject +
  //         ': ' + linkedId + '::' + linkedIdUser)
  //     )
  //   );
  // }

  // readNotification(idNotify: number) {
  //
  //   const found = this.notifications.getValue().find(n => n.idNotify === idNotify);
  //   console.log('UserService::readNotification ', found);
  //
  //   const readReceipt = found ? found.readReceipt : false;
  //   const qUpdate = gql`mutation {
  //     updateUsrNotifyByIdNotify(input: {usrNotifyPatch:
  //     {isRead: true, sUpdateUser: ${this.me.idAdmUser}}, idNotify: ${idNotify}})
  //     {
  //       clientMutationId
  //       __typename
  //       usrNotify {
  //         isRead
  //         idNotify
  //       }
  //     }
  //   }`;
  //
  //   console.log('UZerz::readNotification', idNotify, qUpdate);
  //
  //   return this.apollo.mutate<any>({mutation: qUpdate}).pipe(
  //     tap(response => {
  //         console.log('UZerz::readNotification Marked Read', response);
  //
  //         let notes = this.notifications.getValue();
  //         if (notes) {
  //           console.log('UZerz::readNotification marking cache read');
  //           const location = notes.find(n => n.idNotify === idNotify);
  //           location.isRead = true;
  //           this.notifications.next(notes);
  //
  //           // if (readReceipt) {
  //           //   this.makeNotify(found.linkedUser, this.me.userName + '\'s notification \'' + found.message + '\' has been read.',
  //           //     null, null, this.me.idAdmUser);
  //           // }
  //         }
  //       }
  //       // err => {
  //       //   this.logger.logErrObject(this.me, 'UZerz::readNotification', err,
  //       //     'Could not update Notification to isRead');
  //       //   observer.error(err);
  //     ),
  //     catchError(err => {
  //       this.logger.logErrObject(this.me, 'UZerz::readNotification', err, 'Could not update Notification to isRead');
  //       return of([]);
  //     }),
  //   );
  // }

  getUserTypeIcon(): string {
    return this.me ? this.userIcon(this.me.idUserType) : this.userIcon(-1);
  }


  // TODO: use the user type table!
  userIcon(idUserType: number): string {

    switch (idUserType) {
      case 13:
        return 'pets';
      case 100:
        return 'supervisor_account';
      case 200:
        return 'directions_run';
      case 300:
        return 'emoji_people';
      default:
        return 'accessibility';
    }

  }


}
