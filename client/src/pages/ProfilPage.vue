<script setup lang='ts'>
import { useAuthActor } from 'boot/auth'

const {
  send,
  select,
  snapshot,
} = useAuthActor()

const user = select(s => s.context.user)
</script>

<template>
  <q-page class="q-pa-md bg-grey-2">
    <div class="text-subtitle2 text-weight-regular text-grey-7 q-mb-sm">
      Compte Google
    </div>
    <q-list
      padding
      class="bg-white my-border"
    >
      <q-item v-if="snapshot.matches('Authenticated') && user">
        <q-item-section avatar>
          <q-avatar>
            <img :src="user.photoURL || 'src/assets/avatar-blank.svg'">
          </q-avatar>
        </q-item-section>
        <q-item-section>
          <q-item-label>{{ user.displayName }}</q-item-label>
          <q-item-label caption>
            {{ user.email }}
          </q-item-label>
        </q-item-section>
      </q-item>
      <q-item v-if="snapshot.matches('Authenticating') || snapshot.matches('AuthError') || snapshot.matches('CheckingAuthStatus')">
        <q-item-section avatar>
          <q-skeleton type="QAvatar" />
        </q-item-section>

        <q-item-section>
          <q-item-label>
            <q-skeleton type="text" />
          </q-item-label>
          <q-item-label caption>
            <q-skeleton
              type="text"
              width="65%"
            />
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

<style scoped>
.text-subtitle2 {
  letter-spacing: 0.5px;
}</style>
