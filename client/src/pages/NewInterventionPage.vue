<script setup lang='ts'>
import { Timestamp, addDoc, collection } from 'firebase/firestore'
import { date, useQuasar } from 'quasar'
import { db } from 'src/boot/firebase'
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

const { notify } = useQuasar()
const router = useRouter()

const qDateProxy = ref()
const collectionRef = collection(db, 'interventions')
const loading = ref(false)

type DocData = {
  datetime: string,
  adresse: string,
  évènement: string,
  véhicule: string,
  rôle: string,
  remarques: string,
}

const formValues = reactive<DocData>({
  datetime: date.formatDate(Date.now(), 'YYYY-MM-DD'),
  adresse: '',
  évènement: '',
  véhicule: '',
  rôle: '',
  remarques: '',
})

const submit = async () => {
  loading.value = true
  try {
    const docRef = await addDoc(collectionRef, {
      ...formValues,
      created_at: Timestamp.now(),
      datetime: Timestamp.fromMillis(Date.parse(formValues.datetime)),
    })
    console.log(docRef.id)
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

</script>

<template>
  <q-page class="q-pa-sm bg-red-1">
    <q-card class="col q-gutter-md q-ma-none q-px-md q-py-sm">
      <q-input
        v-model="formValues.datetime"
        label="Date"
        outlined
      >
        <template #before>
          <q-icon name="event" />
        </template>
        <template #append>
          <q-icon
            name="edit"
            class="cursor-pointer"
          >
            <q-popup-proxy
              ref="qDateProxy"
              transition-show="scale"
              transition-hide="scale"
            >
              <q-date
                v-model="formValues.datetime"
                mask="YYYY-MM-DD"
                @update:model-value="() => qDateProxy.hide()"
              />
            </q-popup-proxy>
          </q-icon>
        </template>
      </q-input>
      <q-input
        v-model="formValues.adresse"
        label="Adresse"
        outlined
      >
        <template #before>
          <q-icon name="place" />
        </template>
      </q-input>
      <q-input
        v-model="formValues.évènement"
        label="Évènement"
        outlined
      >
        <template #before>
          <q-icon name="fireplace" />
        </template>
      </q-input>
      <q-input
        v-model="formValues.véhicule"
        label="Véhicule"
        outlined
      >
        <template #before>
          <q-icon name="local_shipping" />
        </template>
      </q-input>
      <q-input
        v-model="formValues.rôle"
        label="Rôle"
        outlined
      >
        <template #before>
          <q-icon name="person" />
        </template>
      </q-input>
      <q-input
        v-model="formValues.remarques"
        type="textarea"
        label="Remarques"
        rows="3"
        outlined
      >
        <template #before>
          <q-icon name="notes" />
        </template>
      </q-input>
      <div class="row">
        <q-btn
          :loading="loading"
          color="red-8"
          label="sauvegarder"
          class="full-width"
          @click="submit"
        />
      </div>
    </q-card>
  </q-page>
</template>

<style scoped>

</style>
