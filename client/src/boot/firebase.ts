import { boot } from 'quasar/wrappers'
import { initializeApp } from 'firebase/app'

function throwError (key: string): never {
  throw new Error(`process.env is missing key ${key}`)
}

const config = {
  apiKey: process.env.FIREBASE_API_KEY || throwError('FIREBASE_API_KEY'),
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || throwError('FIREBASE_AUTH_DOMAIN'),
  projectId: process.env.FIREBASE_PROJECT_ID || throwError('FIREBASE_PROJECT_ID'),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || throwError('FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || throwError('FIREBASE_MESSAGING_SENDER_ID'),
  appId: process.env.FIREBASE_APP_ID || throwError('FIREBASE_APP_ID'),
}

export const app = initializeApp(config)

// "async" is optional;
// more info on params: https://v2.quasar.dev/quasar-cli/boot-files
export default boot(async (/* { app, router, ... } */) => {
  // something to do
})
