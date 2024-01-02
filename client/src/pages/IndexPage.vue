<script setup lang="ts">
import { date as QuasarDate, useQuasar } from 'quasar'
import { reactive, ref } from 'vue'

const $q = useQuasar()

const formValues = reactive({
  date: QuasarDate.formatDate(Date.now(), 'YYYY/MM/DD'),
  adresse: 'foo',
  évènement: 'Incendie',
  véhicule: 'Tonne',
  rôle: 'T2',
  remarques: 'Ct le fuun',
})

const loading = ref(false)
const submit = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    $q.notify(
      "C'est sauvegardé mais pas pour de vrai 🤣",
    )
  }, 2000)
}
</script>

<template>
  <q-page class="col q-gutter-md q-pa-md">
    <q-input
      v-model="formValues.date"
      label="Date"
      outlined
      mask="date"
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
              v-model="formValues.date"
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
