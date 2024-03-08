import { createSkyInspector } from '@statelyai/inspect'
import { useSelector } from '@xstate/vue'
import { Notify } from 'quasar'
import { boot } from 'quasar/wrappers'
import { authMachine } from 'src/actors/authMachine'
import { Ref, toValue } from 'vue'
import { Router } from 'vue-router'
import { Actor, SnapshotFrom, StateValueFrom, createActor } from 'xstate'

const { inspect } = createSkyInspector({
  autoStart: !!process.env.DEV,
})
type AuthMachine = typeof authMachine
let actorRef: Actor<AuthMachine>

function createAuthLogic ({ router }: { router: Router }): AuthMachine {
  return authMachine.provide({
    actions: {
      notifySuccess: (_, params: { message: string }) => Notify.create({
        type: 'positive',
        message: params.message,
      }),
      notifyError: ({ self }, params: { error: string }) => Notify.create({
        type: 'negative',
        message: `Erreur : ${params.error}`,
        timeout: 0,
        actions: [
          {
            icon: 'close',
            color: 'white',
            handler: () => self.send({ type: 'clear_error' }),
          },
          {
            icon: 'replay',
            color: 'white',
            handler: () => self.send({ type: 'retry' }),
          },
        ],
      }),
      redirectRoute: async () => {
        const { redirect } = toValue(router.currentRoute).query
        if (typeof redirect === 'string') {
          await router.push(redirect)
        }
      },
    },
  })
}

export function useAuthActor (): {
  actorRef: Actor<AuthMachine>
  snapshot: Ref<SnapshotFrom<AuthMachine>>
  send: Actor<AuthMachine>['send']
  select: <T>(selector: (snapshot: SnapshotFrom<AuthMachine>) => T) => Ref<T>
  matches: (partialStateValue: StateValueFrom<AuthMachine>) => Ref<boolean>
  } {
  const snapshot = useSelector(actorRef, s => s)
  const send = actorRef.send
  const select = <T>(selector: (snapshot: SnapshotFrom<AuthMachine>) => T): Ref<T> => useSelector(actorRef, selector)
  const matches = (state: StateValueFrom<AuthMachine>): Ref<boolean> => useSelector(actorRef, s => s.matches.bind(s)(state))

  actorRef.subscribe(nextSnapshot => {
    snapshot.value = nextSnapshot
  })

  return {
    actorRef,
    send,
    snapshot,
    select,
    matches,
  }
}

export default boot(async ({ router }) => {
  console.info('boot/auth')

  actorRef = createActor(createAuthLogic({
    router,
  }), {
    inspect,
  }).start()

  router.beforeEach((to) => {
    const isAuthenticated = actorRef.getSnapshot().matches('Authenticated')

    if (
      !isAuthenticated && to.name !== 'Profil'
    ) {
      return {
        name: 'Profil',
        query: { redirect: to.fullPath },
      }
    }
  })
})
