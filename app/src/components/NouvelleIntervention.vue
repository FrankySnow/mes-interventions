<template>
  <q-card style="height:65vh">
    <q-card-section class="row items-center q-pb-none">
      <div class="text-h6">Créer intervention</div>
      <q-space />
      <q-btn icon="close" flat round v-close-popup />
    </q-card-section>

    <q-card-section class="q-gutter-md items-center">
      <q-input
        label="Date"
        outlined
        v-model="date"
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
                v-model="date"
                color="red"
                @input="() => $refs.qDateProxy.hide()"
              />
            </q-popup-proxy>
          </q-icon>
        </template>
      </q-input>
      <q-input label="Adresse" outlined :value="address">
        <template v-slot:before>
          <q-icon name="place" />
        </template>
      </q-input>
      <q-input label="Critère" outlined>
        <template v-slot:before>
          <q-icon name="fireplace" />
        </template>
      </q-input>
      <q-input label="Véhicule" outlined>
        <template v-slot:before>
          <q-icon name="local_shipping" />
        </template>
      </q-input>
      <q-input label="Rôle" outlined>
        <template v-slot:before>
          <q-icon name="person" />
        </template>
      </q-input>
      <q-input type="textarea" label="Remarques" outlined>
        <template v-slot:before>
          <q-icon name="notes" />
        </template>
      </q-input>
      <div class="row">
        <q-btn
          :loading="loading"
          color="red"
          @click="simulateProgress"
          label="sauvegarder"
          class="full-width"
        />
      </div>
    </q-card-section>
  </q-card>
</template>

<script>
import { date } from 'quasar'

export default {
  name: 'NouvelleIntervention',
  props: {
    address: {
      type: String,
      default: "",
    }
  },
  data() {
    return {
      date: date.formatDate(Date.now(), 'YYYY/MM/DD'),
      loading: false,
    }
  },
  methods: {
    simulateProgress() {
      this.loading = true
      setTimeout(() => {
        this.loading = false
        this.$q.notify(
          "C'est sauvegardé mais pas pour de vrai 🤣"
        )
        this.$emit('saved')
      }, 2000)
    },
  },
}
</script>

<style></style>
