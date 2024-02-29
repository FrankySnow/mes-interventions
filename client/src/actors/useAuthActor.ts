import { createSkyInspector } from '@statelyai/inspect'
import { useActor, useSelector } from '@xstate/vue'
import { useQuasar } from 'quasar'
import { authMachine } from 'src/actors/authMachine'
import type { InjectionKey, Ref } from 'vue'
import { inject, provide } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Actor, SnapshotFrom } from 'xstate'

export const authKey = Symbol('auth') as InjectionKey<Actor<typeof authMachine>>

export function provideAuthActor (): void {
  const { inspect } = createSkyInspector()
  const { notify } = useQuasar()
  const { query } = useRoute()
  const router = useRouter()

  const { actorRef } = useActor(authMachine.provide({
    actions: {
      notifySuccess: (_, params: { message: string }) => notify({
        type: 'positive',
        message: params.message,
      }),
      notifyError: ({ self }, params: { error: string }) => notify({
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
        if (query.redirect && !Array.isArray(query.redirect)) {
          await router.push(query.redirect)
        }
      },
    },
  }), {
    inspect,
  })

  provide(authKey, actorRef)
}

export function useAuthActor (): {
  snapshot: Ref<SnapshotFrom<typeof authMachine>>,
  send: Actor<typeof authMachine>['send'],
  actorRef: Actor<typeof authMachine>,
  } {
  const actorRef = inject(authKey)

  if (!actorRef) {
    throw new Error('authActor not provided')
  }

  const send = actorRef.send
  const snapshot = useSelector(actorRef, s => s)

  return {
    send,
    snapshot,
    actorRef,
  }
}
