<script setup lang="ts">
import { date, useQuasar } from 'quasar'
import { reactive, ref } from 'vue'
import { collection, addDoc, getFirestore, Timestamp } from 'firebase/firestore'
import { app } from 'boot/firebase'

const { notify } = useQuasar()

const db = getFirestore(app)

const formValues = reactive({
  datetime: date.formatDate(Date.now(), 'YYYY-MM-DD'),
  adresse: '',
  évènement: '',
  véhicule: '',
  rôle: '',
  remarques: '',
})

const loading = ref(false)

const submit = async () => {
  loading.value = true
  const docRef = await addDoc(collection(db, 'interventions'), {
    ...formValues,
    created_at: Timestamp.now(),
    datetime: Timestamp.fromMillis(Date.parse(formValues.datetime)),
  })
  console.log(docRef.id)
  notify(
    "C'est sauvegardé 🔥",
  )
  loading.value = false
}

const qDateProxy = ref()
</script>

<template>
  <q-page class="col q-gutter-md q-pa-md">
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
        color="primary"
        label="sauvegarder"
        class="full-width"
        @click="submit"
      />
    </div>
  </q-page>
</template>
