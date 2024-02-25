<script setup lang="ts">
import { createSkyInspector } from '@statelyai/inspect'
import { useActor } from '@xstate/vue'
import { useQuasar } from 'quasar'
import { authMachine } from 'src/actors/authMachine'
import { provide } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { authKey } from './keys'

const { inspect } = createSkyInspector()
const { notify } = useQuasar()
const { query } = useRoute()
const router = useRouter()

const {
  send,
  // snapshot,
  actorRef,
} = useActor(authMachine.provide({
  actions: {
    notifySuccess: (_, params: { message: string }) => notify({
      type: 'positive',
      message: params.message,
    }),
    notifyError: (_, params: { error: string }) => notify({
      type: 'negative',
      message: `Erreur : ${params.error}`,
      timeout: 0,
      actions: [
        {
          icon: 'close',
          color: 'white',
          handler: () => send({ type: 'clear_error' }),
        },
        {
          icon: 'replay',
          color: 'white',
          handler: () => send({ type: 'retry' }),
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
</script>

<template>
  <router-view />
</template>
