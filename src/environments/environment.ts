// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

// @ts-ignore
export const environment = {
  production: false,
  APP_NAME: require('../../package.json').name,
  DB_MIN_VERSION: require('../../package.json').mindb,
  APP_VERSION: require('../../package.json').version,
  DATA_URL: 'http://localhost:5000/graphql', // LOCAL
  // DATA_URL: 'https://wgraphile-dot-webstr-psi.appspot.com/', // PSI
  // DATA_URL: 'https://wgraphile-dot-webstr-dev.appspot.com/', // DEMO
  env_name: 'development',
  firebase: {
    apiKey: 'AIzaSyDeI2tXa-WIwAf6-6W1Am-NkuvJzKb5Zk0',
    authDomain: 'webstr-dev.firebaseapp.com',
    databaseURL: 'https://webstr-dev.firebaseio.com',
    projectId: 'webstr-dev',
    storageBucket: 'webstr-dev.appspot.com',
    messagingSenderId: '932872180359',
    appId: '1:932872180359:web:58f1719dd438fedae49e22',
  },
  rollbarConfig: {
    accessToken: 'd1efa76c12184bb9991ae0825d92cc0b',
    captureUncaught: true,
    captureUnhandledRejections: true,
    environment: 'demo',
  },
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
