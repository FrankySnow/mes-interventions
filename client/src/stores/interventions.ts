import { useFirestore } from '@vueuse/firebase'
import { db } from 'boot/firebase'
import { Timestamp, addDoc, collection } from 'firebase/firestore'
import { defineStore } from 'pinia'
import { useQuasar } from 'quasar'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

export type InterventionDocData = {
  datetime: string,
  adresse: string,
  évènement: string,
  véhicule: string,
  rôle: string,
  remarques: string,
}
export const useInterventionsStore = defineStore('interventions', () => {
  const collectionRef = collection(db, 'interventions')
  const { notify } = useQuasar()
  const loading = ref(false)
  const router = useRouter()
  const interventions = useFirestore(collectionRef)

  async function createNewIntervention (formValues: InterventionDocData): Promise<void> {
    loading.value = true
    try {
      const docRef = await addDoc(collectionRef, {
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
    interventions.value !== undefined ? interventions.value.length : 0,
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
