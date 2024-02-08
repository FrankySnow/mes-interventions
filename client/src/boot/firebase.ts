import { boot } from 'quasar/wrappers'
import { initializeApp } from 'firebase/app'
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore'
import { User, connectAuthEmulator, getAuth, onAuthStateChanged } from 'firebase/auth'

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
export const db = getFirestore(app)
export const auth = getAuth()
auth.languageCode = 'fr'

if (process.env.DEV) {
  connectFirestoreEmulator(db, '127.0.0.1', 8080)
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', {
    disableWarnings: true,
  })
}

function isAuthenticated (): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        unsubscribe()
        resolve(user !== null)
      },
      reject,
    )
  })
}

export default boot(async ({ router }) => {
  router.beforeEach(async (to) => {
    const authenticated = await isAuthenticated().catch(console.error)
    if (
      !authenticated && to.name !== 'Profil'
    ) {
      return {
        name: 'Profil',
        query: { redirect: to.fullPath },
      }
    }
  })
})
