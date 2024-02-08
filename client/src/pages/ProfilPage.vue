<script setup lang='ts'>
import { storeToRefs } from 'pinia'
import { useUsersStore } from 'src/stores/users'

const users = useUsersStore()
const { isAuthenticated, user } = storeToRefs(users)
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

      <q-item v-if="isAuthenticated">
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
        v-if="isAuthenticated"
        v-ripple
        clickable
        @click="users.logOut"
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
        v-if="!isAuthenticated"
        v-ripple
        clickable
        @click="users.logInWithGoogle"
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
