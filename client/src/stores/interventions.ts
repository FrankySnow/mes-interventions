import { useFirestore } from '@vueuse/firebase'
import { db } from 'boot/firebase'
import { Timestamp, addDoc, collection } from 'firebase/firestore'
import { defineStore, storeToRefs } from 'pinia'
import { useQuasar } from 'quasar'
import { computed, ref, watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import { useUsersStore } from './users'

export type InterventionDocData = {
  datetime: string,
  adresse: string,
  évènement: string,
  véhicule: string,
  rôle: string,
  remarques: string,
}
export const useInterventionsStore = defineStore('interventions', () => {
  const { user } = storeToRefs(useUsersStore())
  const { notify } = useQuasar()
  const router = useRouter()
  const loading = ref(false)
  const interventionsCollection = ref()
  const interventions = useFirestore(interventionsCollection)

  // Se déclenche une fois que le `user` est correctement chargé OU lorsqu'il change après une déconnexion
  watchEffect(() => {
    if (user && user.value) {
      interventionsCollection.value = collection(db, 'users', user.value.uid, 'interventions')
    }
  })

  async function createNewIntervention (formValues: InterventionDocData): Promise<void> {
    loading.value = true
    try {
      const docRef = await addDoc(interventionsCollection.value, {
        ...formValues,
        created_at: Timestamp.now(),
        datetime: Timestamp.fromMillis(Date.parse(formValues.datetime)),
      })
      notify({
        message: `C'est sauvegardé 🔥 : ${docRef.id}`,
        type: 'positive',
      })
      router.push('/')
    } catch (error) {
      notify({
        message: `Erreur : ${error}`,
        type: 'negative',
      })
    } finally {
      loading.value = false
    }
  }

  const interventionsCount = computed((): number =>
    interventions.value ? interventions.value.length : 0,
  )

  /*
  // Méthode correcte selon Firebase mais pas assez performante :
  const interventionsCount = ref(0)
  watch(interventions, async () => {
    const snapshot = await getCountFromServer(collectionRef)
    interventionsCount.value = snapshot.data().count
  },
  { immediate: true })
  */

  return {
    interventions,
    loading,
    interventionsCount,
    createNewIntervention,
  }
})
