<template>
  <q-card style="height:65vh">
    <q-card-section class="row items-center q-pb-none">
      <div class="text-h6">Nouvelle intervention</div>
      <q-space />
      <q-btn v-close-popup icon="close" flat round />
    </q-card-section>

    <q-card-section class="q-gutter-md items-center">
      <q-input
        v-model="newInterventionData.date"
        label="Date"
        outlined
        mask="date"
      >
        <template v-slot:before>
          <q-icon name="event" />
        </template>
        <template v-slot:append>
          <q-icon name="edit" class="cursor-pointer">
            <q-popup-proxy
              ref="qDateProxy"
              transition-show="scale"
              transition-hide="scale"
            >
              <q-date
                v-model="newInterventionData.date"
                color="red"
                @input="onDateInput"
              />
            </q-popup-proxy>
          </q-icon>
        </template>
      </q-input>
      <q-input
        v-model="newInterventionData.adresse.place_name"
        label="Adresse"
        outlined
      >
        <template v-slot:before>
          <q-icon name="place" />
        </template>
      </q-input>
      <q-input v-model="newInterventionData.critère" label="Critère" outlined>
        <template v-slot:before>
          <q-icon name="fireplace" />
        </template>
      </q-input>
      <q-input v-model="newInterventionData.véhicule" label="Véhicule" outlined>
        <template v-slot:before>
          <q-icon name="local_shipping" />
        </template>
      </q-input>
      <q-input v-model="newInterventionData.rôle" label="Rôle" outlined>
        <template v-slot:before>
          <q-icon name="person" />
        </template>
      </q-input>
      <q-input
        v-model="newInterventionData.remarques"
        autogrow
        label="Remarques"
        outlined
      >
        <template v-slot:before>
          <q-icon name="notes" />
        </template>
      </q-input>
      <q-select
        v-model="newInterventionData.tags"
        label="Tags"
        outlined
        use-input
        use-chips
        multiple
        input-debounce="0"
        new-value-mode="add"
      >
        <template v-slot:before>
          <q-icon name="label" />
        </template>
      </q-select>
      <div class="row">
        <q-btn
          :loading="loading"
          color="red"
          icon="save"
          unelevated
          class="full-width"
          label="sauvegarder"
          @click="simulateProgress"
        />
      </div>
    </q-card-section>
  </q-card>
</template>

<script>
import { date } from 'quasar'

export default {
  name: 'NewIntervention',
  props: {
    searchResult: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      loading: false,
      newInterventionData: {
        date: date.formatDate(Date.now(), 'YYYY/MM/DD'),
        adresse: this.$props.searchResult,
        critère: '',
        véhicule: '',
        rôle: '',
        remarques: '',
        tags: [],
      },
    }
  },
  methods: {
    simulateProgress() {
      this.loading = true
      setTimeout(() => {
        this.loading = false

        this.$q.notify("C'est sauvegardé mais pas pour de vrai 🤣")
        this.$emit('saved', this.newInterventionData.adresse)
      }, 500)
    },
    onDateInput(/* event */) {
      this.$refs.qDateProxy.hide()
    },
  },
}
</script>

<style></style>
