export const environment = {
  production: true,
  APP_NAME: require('../../package.json').name,
  DB_MIN_VERSION: require('../../package.json').mindb,
  APP_VERSION: require('../../package.json').version,
  DATA_URL: 'https://graphilestr-dot-webstr-psi.appspot.com',
  env_name: 'production',
  firebase: {
    apiKey: 'AIzaSyCUgpbJI2DQpV58zOgfJ3zPYu4v_MbgXKc',
    authDomain: 'webstr-psi.firebaseapp.com',
    databaseURL: 'https://webstr-psi.firebaseio.com',
    projectId: 'webstr-psi',
    storageBucket: 'webstr-psi.appspot.com',
    messagingSenderId: '984257693298',
    appId: '1:984257693298:web:1ad8369ca04a2acb39e4eb',
    measurementId: 'G-NEZ1QMYR6Y',
  },
  rollbarConfig: {
    accessToken: 'd1efa76c12184bb9991ae0825d92cc0b',
    captureUncaught: true,
    captureUnhandledRejections: true,
    environment: 'production',
  },
};
