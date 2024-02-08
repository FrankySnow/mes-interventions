import { defineStore } from 'pinia'
import { useAuth } from '@vueuse/firebase'
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth'
import { useQuasar } from 'quasar'
import { auth } from 'src/boot/firebase'
import { useRoute, useRouter } from 'vue-router'

export const useUsersStore = defineStore('users', () => {
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
      if (process.env.DEV) console.log('user', user)
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

  return {
    isAuthenticated,
    user,
    logInWithGoogle,
    logOut,
  }
})
