import Constants from 'expo-constants'
import { Platform } from 'react-native'

const localhost = Platform.OS === 'ios' ? 'localhost:8080' : '10.0.2.2:8080'

const ENV = {
  /* dev: {
    apiUrl: 'http://erp.test/',
    amplitudeApiKey: null,
  },
  prod: {
    apiUrl: 'http://erp.test/',
    amplitudeApiKey: null,
    // Add other keys you want here
  }, */
  dev: {
    apiUrl: 'https://api.vidadynamics.com/',
    amplitudeApiKey: null,
    APP_KEY: '1',
    chatEnv: {
      authEndpoint: 'https://api.vidadynamics.com/broadcasting/auth',
      wsHost: 'api.vidadynamics.com',
      wsPort: 8443,
      wssPort: 8443,
      enabledTransports: ['ws', 'wss'],
      forceTLS: false,
    },
  },
  prod: {
    apiUrl: 'https://api.vidadynamics.com/',
    amplitudeApiKey: '[Enter your key here]',
    APP_KEY: '1',
    chatEnv: {
      authEndpoint: 'https://api.vidadynamics.com/broadcasting/auth',
      wsHost: 'api.vidadynamics.com',
      wsPort: 8443,
      wssPort: 8443,
      enabledTransports: ['ws', 'wss'],
      forceTLS: false,
    },
    // Add other keys you want here
  },
}

const getEnvVars = (env = Constants.manifest.releaseChannel) => {
  // What is __DEV__ ?
  // This variable is set to true when react-native is running in Dev mode.
  // __DEV__ is true when run locally, but false when published.
  if (__DEV__) {
    return ENV.dev
  } else {
    return ENV.prod
  }
}

export default getEnvVars
