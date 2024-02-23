<script setup lang='ts'>
import { createSkyInspector } from '@statelyai/inspect'
import { useActor } from '@xstate/vue'
import { useQuasar } from 'quasar'
import { authMachine } from 'src/actors/authMachine'
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const { inspect } = createSkyInspector()
const { notify } = useQuasar()
const { query } = useRoute()
const router = useRouter()

const { send, snapshot } = useActor(authMachine.provide({
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

const user = computed(() => snapshot.value.context.user)
</script>

<template>
  <q-page class="q-pa-md bg-red-1">
    <q-list
      padding
      class="bg-white rounded-borders"
    >
      <q-item-label header>
        Compte Google
      </q-item-label>

      <q-item v-if="snapshot.matches('Authenticated')">
        <q-item-section avatar>
          <q-avatar>
            <img :src="user?.photoURL || 'src/assets/avatar-blank.svg'">
          </q-avatar>
        </q-item-section>
        <q-item-section>
          <q-item-label>{{ user?.displayName }}</q-item-label>
          <q-item-label caption>
            {{ user?.email }}
          </q-item-label>
        </q-item-section>
      </q-item>
      <q-item
        v-if="snapshot.matches('Authenticated')"
        v-ripple
        clickable
        @click="send({ type: 'sign_out' })"
      >
        <q-item-section avatar>
          <q-avatar
            icon="logout"
            text-color="grey-8"
          />
        </q-item-section>
        <q-item-section>
          <q-item-label>Déconnecter</q-item-label>
        </q-item-section>
      </q-item>
      <q-item
        v-if="snapshot.matches('Unauthenticated')"
        v-ripple
        clickable
        @click="send({ type: 'initiate_login' })"
      >
        <q-item-section avatar>
          <q-avatar
            icon="login"
            text-color="grey-8"
          />
        </q-item-section>
        <q-item-section>
          <q-item-label>Connecter</q-item-label>
        </q-item-section>
      </q-item>
    </q-list>
  </q-page>
</template>
