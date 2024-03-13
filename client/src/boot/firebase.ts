import { FirebaseApp, initializeApp } from 'firebase/app'
import { Auth, connectAuthEmulator, getAuth } from 'firebase/auth'
import { Firestore, connectFirestoreEmulator, getFirestore } from 'firebase/firestore'
import { boot } from 'quasar/wrappers'
import { VueFire, VueFireAuth } from 'vuefire'

function getEnv (key: string): string {
  const env = process.env[key]
  if (env === undefined) {
    throw new Error(`process.env is missing key ${key}`)
  }
  return env
}

const config = {
  apiKey: getEnv('FIREBASE_API_KEY'),
  authDomain: getEnv('FIREBASE_AUTH_DOMAIN'),
  projectId: getEnv('FIREBASE_PROJECT_ID'),
  storageBucket: getEnv('FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: getEnv('FIREBASE_MESSAGING_SENDER_ID'),
  appId: getEnv('FIREBASE_APP_ID'),
}

export const firebaseApp: FirebaseApp = initializeApp(config)
export const db: Firestore = getFirestore(firebaseApp)
export const auth: Auth = getAuth()
auth.languageCode = 'fr'

if (process.env.DEV) {
  connectFirestoreEmulator(db, '127.0.0.1', 8080)
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', {
    disableWarnings: true,
  })
}

export default boot(async ({ app }) => {
  console.info('boot/firebase')

  app.use(VueFire, {
    firebaseApp,
    modules: [
      VueFireAuth(),
    ],
  })
})
