import { AuthError, GoogleAuthProvider, User, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth'
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { auth, db } from 'src/boot/firebase'
import { assign, fromPromise, log, setup } from 'xstate'

const provider = new GoogleAuthProvider()

const loginWithGoogle = fromPromise(async (): Promise<User> => {
  const { user } = await signInWithPopup(auth, provider)
  const userDocRef = doc(db, 'users', user.uid)
  const userDoc = await getDoc(userDocRef)
  if (!userDoc.exists()) {
    await setDoc(userDocRef, {
      created_at: serverTimestamp(),
    })
  }
  return user
})

const logout = fromPromise(async () => {
  await signOut(auth)
})

const getCurrentUser = fromPromise((): Promise<User | null> => {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        unsubscribe()
        resolve(user)
      },
      reject,
    )
  })
})

export const authMachine = setup({
  types: {
    context: {} as {
      user: User | null,
      error: AuthError | null,
    },
    events: {} as
      | { type: 'initiate_login' }
      | { type: 'sign_out' }
      | { type: 'retry' }
      | { type: 'clear_error' },
  },
  actions: {
    setUser: assign({
      // @ts-expect-error https://github.com/statelyai/xstate/issues/4720
      user: ({ event }) => event.output,
    }),
    setError: assign({
      // @ts-expect-error https://github.com/statelyai/xstate/issues/4720
      error: ({ event }) => event.error,
    }),
    clearUser: assign({
      user: null,
    }),
    clearError: assign({
      error: null,
    }),
    logEvent: log(({ event }) => event),
    logContext: log(({ context }) => context),
    notifySuccess: (_, params: { message: string }) => {
      throw new Error(`notifySuccess not implemented : ${params.message}`)
    },
    notifyError: (_, params: { error: string }) => {
      throw new Error(`notifyError not implemented : ${params.error}`)
    },
    redirectRoute: () => { throw new Error('redirectRoute not implemented') },
  },
  actors: {
    getCurrentUser,
    loginWithGoogle,
    logout,
  },
  guards: {
    // @ts-expect-error https://github.com/statelyai/xstate/issues/4720
    outputIsNotNull: ({ event }) => event.output !== null,
  },
  delays: {},
}).createMachine(
  {
    /** @xstate-layout N4IgpgJg5mDOIC5QEMCuAXAFgOgKoDs0sx90BLAY2XUgGIz8zzqwB9AGwHsoGBtABgC6iUAAdOsJmU74RIAB6IAjPwDsq7ADZ+ATgAsAJhUGjJgwBoQAT0Sr+AVmz2dAZgAcSk6733VLgL7+lkQ4AIIYmCTkVOT4ULQQMmDYDABunADWySHY4cSklNQMUAhpnDHS+AKC1XLikuQycooISvYGbk6aBj5uag5GepY2CJoumk4uOkou9ipKHjr2gcERuRFRhbHxYABOu5y72KLs1ABmhwC22Dl5kQUVcaX46RUy1bVIIPVSTV8tKnUWl0hmMphMw0QJhc2D0qk0vnabjcU34ShWIFuGweLAgtEkUHwrE4GE+Ygkv1k-2UmiUemw-G6cM0fRMSk8kIQblUSi0qgM-BMfU0S34ASCmLWdwAovtDrRdmB0LsrGTvhTGlTQAD+HDYW0xS4jbMdKodJy9H19W4fCLWR4DOLVlh1lhZQddrQKOwwMhdqw9h61T9Nc1bNpsAtVPY+volGbVG5OfYptgDAiRX4dJpDPZNBicgBlMiE4oAeQwCSSKRemWya2LpbiFfQz1eRXeQmDGsqYYQ6Z0DMTdNmebZPk5LIMDLaqj0Shz9l1egLDZLjGblcDh2Op3QF121yL6-LGDb5Q7VS7QjqPb+2qhIqHHj0o+6g3sFsdkd07lNPhUI1VxdABhSIKAyYo7kLdBqFQWAq3wZIyiyG41jAsAIKgiIYLg2BzzeK8ahvL4Q17al+yfNQXzfcdP2sRAPCcfgWP4G1dHafllglHIMKwuJoNg9B4MQ5Da1Q3jwMggScKE+CCMvD4lGEUi7y1BRH0HaiR3sMcP05I1+EjMdfBceNkWcYCcD46SoEEvDaG3I4TnOK40NAqTsKwXDhPwspCI+EjyQaciH0orTh1fXT3zpeiRiMIzoxY412TsFwDECCV8E4CA4DkEJbxC+8NIQABaTROXKhlWJq2q6SsvBCGxaJcUKyk+x0NFsHhPN9ARS1DE5OwJl-B0DG8XwMp4qVmq2Yo2tDCjPGzWFGXTNwlkiuLEE0Wk0wWNx0z0QVOoXBq7k2GJIAW0KSvjS1urFFQ8zaBZ2U5NwI11EUDDmM0Dqm50wgid1Dhu4qWjGIzUV29LdLS1QLRzBkphUBxl3cQHJRdRsNygFtwfUlpXC0Y7ul0VlNDsCwGNGJZsGzZEAJzVwGpsrzMB8+DCb7QbabMNMnpNS19FNTL-CAA */
    context: {
      user: null,
      error: null,
    },
    id: 'auth',
    initial: 'CheckingAuthStatus',
    states: {
      Unauthenticated: {
        on: {
          initiate_login: {
            target: 'Authenticating',
          },
        },
      },

      Authenticating: {
        invoke: {
          input: {},
          src: 'loginWithGoogle',
          onDone: [
            {
              target: 'Authenticated',
              actions: ['setUser', 'logContext', {
                type: 'notifySuccess',
                params: {
                  message: 'Connecté avec succès',
                },
              }, 'redirectRoute'],
            },
          ],
          onError: [
            {
              target: 'AuthError',
              actions: ['setError', 'logContext', {
                type: 'notifyError',
                params: ({ event }) => ({
                  error: `${event.error}`,
                }),
              }, 'logEvent'],
            },
          ],
        },
      },

      Authenticated: {
        on: {
          sign_out: {
            target: 'SigningOut',
          },
        },
      },

      AuthError: {
        on: {
          retry: {
            target: 'Authenticating',
            actions: 'clearError',
          },
          clear_error: {
            target: 'Unauthenticated',
            actions: 'clearError',
          },
        },
      },

      SigningOut: {
        invoke: {
          input: {},
          src: 'logout',
          onDone: [
            {
              target: 'Unauthenticated',
              actions: [
                'clearUser',
                {
                  type: 'notifySuccess',
                  params: {
                    message: 'Déconnecté avec succès',
                  },
                },
              ],
            },
          ],
          onError: [
            {
              target: 'AuthError',
              actions: ['setError', {
                type: 'notifyError',
                params: ({ event }) => ({
                  error: `${event.error}`,
                }),
              }, 'logEvent'],
            },
          ],
        },
      },

      CheckingAuthStatus: {
        invoke: {
          src: 'getCurrentUser',

          onDone: [{
            target: 'Authenticated',
            guard: 'outputIsNotNull',
            actions: 'setUser',
          }, {
            target: 'Unauthenticated',
            actions: 'clearUser',
          }],

          onError: {
            target: 'AuthError',
            actions: ['setError', 'logEvent'],
          },
        },
      },
    },
  },
)
