import { FirebaseApp, initializeApp } from 'firebase/app'
import { Auth, connectAuthEmulator, getAuth } from 'firebase/auth'
import { Firestore, connectFirestoreEmulator, getFirestore } from 'firebase/firestore'
import { boot } from 'quasar/wrappers'
import { VueFire, VueFireAuth, getCurrentUser } from 'vuefire'

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

export default boot(async ({ app, router }) => {
  console.info('boot/firebase')

  app.use(VueFire, {
    firebaseApp,
    modules: [
      VueFireAuth(),
    ],
  })

  router.beforeEach(async (to) => {
    const isUnauthenticated: boolean | void = await getCurrentUser()
      .then(user => !user)
      .catch(console.error)

    if (
      isUnauthenticated && to.name !== 'Profil'
    ) {
      return {
        name: 'Profil',
        query: { redirect: to.fullPath },
      }
    }
  })
})
