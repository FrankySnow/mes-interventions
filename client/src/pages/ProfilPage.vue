<script setup lang='ts'>
import { useAuth } from '@vueuse/firebase'
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth'
import { useQuasar } from 'quasar'
import { auth } from 'src/boot/firebase'
import { useRoute, useRouter } from 'vue-router'

const { notify } = useQuasar()
const provider = new GoogleAuthProvider()
const { isAuthenticated, user } = useAuth(auth)
const { query } = useRoute()
const router = useRouter()

const logInWithGoogle = async () => {
  try {
    const { user } = await signInWithPopup(auth, provider)
    notify({
      type: 'positive',
      message: 'Connecté avec Google',
    })
    console.log('user', user)
    if (query.redirect && !Array.isArray(query.redirect)) {
      await router.push(query.redirect)
    }
  } catch (error) {
    notify({
      type: 'negative',
      message: `Erreur : ${error}`,
    })
    console.error(error)
  }
}

const logOut = async () => {
  try {
    await signOut(auth)
    notify({
      type: 'positive',
      message: 'Déconnecté',
    })
  } catch (error) {
    notify({
      type: 'negative',
      message: `Erreur : ${error}`,
    })
    console.error(error)
  }
}
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
        @click="logOut"
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
        @click="logInWithGoogle"
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
