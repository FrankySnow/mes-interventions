import { useSelector } from '@xstate/vue'
import { db } from 'boot/firebase'
import { User } from 'firebase/auth'
import { CollectionReference, Timestamp, addDoc, collection } from 'firebase/firestore'
import { defineStore } from 'pinia'
import { useQuasar } from 'quasar'
import { useAuthActor } from 'src/actors/useAuthActor'
import { Ref, computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCollection } from 'vuefire'

export type InterventionDocData = {
  datetime: string,
  adresse: string,
  évènement: string,
  véhicule: string,
  rôle: string,
  remarques: string,
}
export const useInterventionsStore = defineStore('interventions', () => {
  const { notify } = useQuasar()
  const router = useRouter()
  const loading = ref(false)
  const {
    actorRef: authActor,
  } = useAuthActor()

  const user = useSelector(authActor, s => s.context.user)

  function getInterventionsCollection (user: Ref<User | null>): CollectionReference | null {
    if (user.value) {
      return collection(db, 'users', user.value.uid, 'interventions')
    }
    return null
  }
  // Synchronise la collection avec l'user et débranche la souscription lorsqu'il est déconnecté
  const interventions = useCollection(getInterventionsCollection(user))

  async function createNewIntervention (formValues: InterventionDocData): Promise<void> {
    loading.value = true
    try {
      const collection = getInterventionsCollection(user)
      if (!collection) throw new Error('unauthenticated')
      const docRef = await addDoc(collection, {
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
