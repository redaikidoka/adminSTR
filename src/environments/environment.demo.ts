export const environment = {
  production: false,
  APP_NAME: require('../../package.json').name,
  DB_MIN_VERSION: require('../../package.json').mindb,
  APP_VERSION: require('../../package.json').version,
  DATA_URL: 'https://graphilestr-dot-webstr-dev.appspot.com/',
  env_name: 'demo',
  firebase: {
    apiKey: 'AIzaSyDeI2tXa-WIwAf6-6W1Am-NkuvJzKb5Zk0',
    authDomain: 'webstr-dev.firebaseapp.com',
    databaseURL: 'https://webstr-dev.firebaseio.com',
    projectId: 'webstr-dev',
    storageBucket: 'webstr-dev.appspot.com',
    messagingSenderId: '932872180359',
    appId: '1:932872180359:web:1c8cb28052d5309ae49e22',
  },
  rollbarConfig: {
    accessToken: 'd1efa76c12184bb9991ae0825d92cc0b',
    captureUncaught: true,
    captureUnhandledRejections: true,
    environment: 'demo',
  },
};
