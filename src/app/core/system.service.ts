import {Injectable} from '@angular/core';
import {Observable, of} from 'rxjs';
import {DbSchema} from './data/db-schema';
import {map, tap} from 'rxjs/operators';
import gql from 'graphql-tag';
import {Apollo} from 'apollo-angular';

import {LoggerService} from './logger.service';
import {AuthService} from './auth.service';
import {AdmApp} from './data/adm-app';

import {environment} from '../../environments/environment';
import { qAdmAppList, qAppsFull} from './data/q-apps';

@Injectable({
  providedIn: 'root'
})
export class SystemService {

  constructor(private apollo: Apollo, private logger: LoggerService, private auth: AuthService) {
  }


  getDbVersion(): Observable<DbSchema> {
    /* vw_schemas selects only the max / latest schema -
      so we can easily select the only entry.
     */
    const qSchema = gql`
      {
        allVwSchemasList {
          version
          checksum
          description
          installedBy
          executionTime
          installedOn
          installedRank
          script
          success
          type
          __typename
        }
      }
    `;

    return this.apollo
      .query<any>({query: qSchema})
      .pipe(
        map((schemaData) => {
          console.log('Loaded schema', schemaData);
          return schemaData.data.allVwSchemasList[0];
        }),
        tap(schema => {
          console.log('SystemService::getDbVersion', schema);
        }, err =>
          this.logger.logErrObject( 'SystemService-getDBVersion', err, 'Could not load DB version info'))
      );
  }


  getApp(idAdmApp: number): Observable<AdmApp> {

    const qApp = gql`query anApp {
      allAdmAppsList(condition: {idAdmApp: ${idAdmApp}  }) {
        idAdmApp
        appPreferences
        title
        description
        helpView helpSummary helpScore helpCalibrate helpFacilitate
        sCreate sCreateUser
        sUpdate sUpdateUser} }`;

    console.log('SystemService::getApp', idAdmApp, qApp);

    return this.apollo.query<any>( {query:qApp, fetchPolicy: 'network-only'}).pipe(
      map( appData => appData.data.allAdmAppsList[0]),
      tap( app => console.log('SystemService::getApp', idAdmApp, app),
        err => this.logger.logErrObject('SystemService::getApp', err, 'Could not load App')
      )
    );
  }

  // PS 2019-07-25 08:52:15 : let's just load everything!
  getApps(): Observable<AdmApp[]> {
    return this.apollo
      .query<any>({query: qAppsFull})
      .pipe(
        map((appData) => appData.data.allAdmAppsList ),
        tap((apps) => console.log('AuthService::getApps - loaded apps', apps))
      );
  }

  loadApps$(){
    return this.apollo.watchQuery<any>({
      query: qAdmAppList,
      fetchPolicy: 'network-only',
      pollInterval: 1000,
    }).valueChanges.pipe(
      tap((res) => {
        console.log('AdminService::loadTemplates - loaded', res);
      }),
      map((result) => result.data.allAdmAppsList)
    );
  }

  // loadApps$(): Observable<AdmApp[]> {
  //   return this.apollo.watchQuery<any>({query: qAdmAppList, fetchPolicy: 'network-only'}).valueChanges.pipe(
  //     map((appData) => {
  //       console.log('SystemService::loadApps - loaded', appData);
  //       return appData.data.allAdmAppsList;
  //     })
  //   );
  // }

  getTestApps(): Observable<AdmApp[]> {

    if (!environment.production) {
      return of([]);
    }

    const qTestApps = gql`query QueryTestApps {
      allVwTestAppsList {
        appPreferences
        description
        helpCalibrate
        helpFacilitate
        helpScore
        helpSummary
        helpView
        idAdmApp
        sCreate
        sCreateUser
        sUpdate
        sUpdateUser
        title
      }
    }
    `;

    console.log('SystemService::getTestApps', qTestApps);
    return this.apollo
      .query<any>({query: qTestApps})
      .pipe(
        map((testApps) => {
          console.log('Loaded test apps', testApps);
          return testApps.data.allVwTestAppsList;
        }),
        tap(schema => {
          console.log('SystemService::getTestApps', schema);
        }, err =>
          this.logger.logErrObject( 'SystemService-getDBVersion', err, 'Could not load DB version info'))
      );
  }


  getTestApp(): Observable<AdmApp> {

    if (environment.production) {
      return of({} as AdmApp);
    }

    const qTestApp = gql`query getTestApp {
      allVwTestAppsList {
        appPreferences
        description
        helpCalibrate
        helpFacilitate
        helpScore
        helpSummary
        helpView
        idAdmApp
        sCreate
        sCreateUser
        sUpdate
        sUpdateUser
        title
      }
    } `;

    // console.log('SystemService::getTestApp() ', qTestApp);

    return this.apollo
      .query<any>({query: qTestApp})
      .pipe(
        map((testApps) => {
          // console.log('Loaded test app', testApps);
          if (testApps.data.allVwTestAppsList.length > 0) {
            return testApps.data.allVwTestAppsList[0];
          } else {
            console.warn('SystemService::getTestApp returned no test apps');
            return of({} as AdmApp);
          }
        }),
        tap(testApp => {
          console.log('SystemService::getTestApp', testApp);
        }, err =>
          this.logger.logErrObject( 'SystemService-getTestApp', err, 'Could not load test app'))
      );
  }

  createApp(app: AdmApp): Observable<number>{
    const qCreate = gql`
      mutation createApp {
        createAdmApp(input: {
          admApp: {
            title: """${app.title}"""
            description: """${app.description ?? ''}"""
            appPreferences: """${app.appPreferences}"""
            helpScore: """${app.helpScore ?? ''}"""
            helpView: """${app.helpView ?? ''}"""
            helpSummary: """${app.helpSummary ?? ''}"""
            helpCalibrate: """${app.helpCalibrate ?? ''}"""
            helpFacilitate: """${app.helpFacilitate ?? ''}"""
            sCreateUser: ${app.sCreateUser}
          }
        })
        { admApp { idAdmApp } }
      }`;
    console.log('SystemService::createApp executing', qCreate, app);
    return this.apollo.mutate<any>({ mutation: qCreate, refetchQueries: ['allAdmAppsList'] }).pipe(
      tap(
        (res) => console.log('SystemService::createApp return info', res),
        (err) =>
          this.logger.logErrObject(
            'SystemService::createApp',
            err,
            'Could not create app :('
          )
      ),
      map(
        (response) => response.data.createAdmApp.admApp.idAdmApp
      )
    );
  }

  updateApp(app: AdmApp): Observable<any> {
    const qUpdate = gql`
      mutation updateApp {
        updateAdmAppByIdAdmApp(input: {
          admAppPatch: {
            title: """${app.title}"""
            description: """${app.description ?? ''}"""
            appPreferences: """${app.appPreferences}"""
            helpScore: """${app.helpScore ?? ''}"""
            helpView: """${app.helpView ?? ''}"""
            helpSummary: """${app.helpSummary ?? ''}"""
            helpCalibrate: """${app.helpCalibrate ?? ''}"""
            helpFacilitate: """${app.helpFacilitate ?? ''}"""
            sUpdateUser: ${app.sUpdateUser}
          } idAdmApp: ${app.idAdmApp}
        }) { clientMutationId }
      }`;
    console.log('SystemService::updateApp executing', qUpdate, app);
    return this.apollo.mutate<any>({
      mutation: qUpdate,
      refetchQueries: ['allAdmAppsList'],
    })
    .pipe(
      tap(
        (res) => console.log('SystemService::updateApp return info', res),
        (err) =>
          this.logger.logErrObject(
            'SystemService::updateApp',
            err,
            'Could not update app :('
          )
      )
    );
  }

  deleteApp(idApp: number, idUser: number): Observable<any> {
    // TODO: touch record, log deletion, then delete
    const qDelete = gql`
      mutation deleteApp {
        updateAdmAppByIdAdmApp(input: {
          admAppPatch: {
            sUpdateUser: ${idUser}
          } idAdmApp: ${idApp}
      }) { clientMutationId }

      createSActivity(
        input: {
          sActivity: {
            isComplete: true
            linkedId: ${idApp}
            linkedObject: 501
            note: "deleting app ${idApp} by ${idUser}"
          }
        }
      ) { clientMutationId }

      deleteAdmAppByIdAdmApp(
        input: {
          idAdmApp: ${idApp}
        }) { deletedAdmAppId }
      }`;
    console.log('SystemService::deleteApp', qDelete, idApp);
    return this.apollo.mutate<any>({
      mutation: qDelete,
      refetchQueries: ['allAdmAppsList'],
    })
    .pipe(
      tap((delResult) => {
        console.log('SystemService::deleteApp return info', delResult);
      })
    );
  }

}
