<template>
  <q-card>
    <q-bar
      class="bg-white"
      style="border-bottom: 1px solid rgba(0,0,0,0.12)"
    >
      <q-btn
        icon="arrow_back"
        flat
        round
        dense
        text-color="grey-7"
        @click="emit('cancel')"
      />
      <q-space />
      <q-btn
        v-close-popup
        icon="close"
        flat
        round
        dense
        text-color="grey-7"
      />
    </q-bar>
    <q-card-section
      style="height:50vh"
      class="scroll"
    >
      <q-list>
        <q-item
          v-ripple
          clickable
          class="q-pa-none"
        >
          <q-item-section avatar>
            <q-icon name="fireplace" />
          </q-item-section>
          <q-item-section>
            <q-item-label>
              {{ newIntervention.évènement.join(' - ') }}
            </q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-btn
              icon="edit"
              dense
              flat
              round
              size="sm"
            />
          </q-item-section>
        </q-item>
        <q-separator spaced />
        <q-expansion-item header-class="q-pa-none">
          <template v-slot:header>
            <q-item-section avatar>
              <q-icon name="event" />
            </q-item-section>
            <q-item-section>
              <q-item-label>
                {{ newIntervention.date.dateTime }}
              </q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-badge
                :color="newIntervention.date.garde.caserne.color"
                :label="newIntervention.date.garde.caserne.name"
              />
            </q-item-section>
          </template>
          <q-input
            v-model="newIntervention.date.dateTime"
            label="Date"
            outlined
            mask="date"
          >
            <template v-slot:before>
              <q-icon name="event" />
            </template>
            <template v-slot:append>
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
                    v-model="newIntervention.date.dateTime"
                    color="red"
                    @input="onDateInput"
                  />
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
        </q-expansion-item>
        <q-separator spaced />
        <q-item
          v-ripple
          class="q-pa-none"
          clickable
          @click="emit('cancel')"
        >
          <q-item-section avatar>
            <q-icon name="place" />
          </q-item-section>
          <q-item-section>
            <q-item-label>
              {{ newIntervention.adresse.label }}
            </q-item-label>
            <q-item-label caption>
              {{ newIntervention.adresse.municipality }}
            </q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-icon
              name="edit"
              dense
              flat
              round
              size="xs"
            />
          </q-item-section>
        </q-item>
        <q-separator spaced />
        <q-expansion-item header-class="q-pa-none">
          <template v-slot:header>
            <q-item-section avatar>
              <q-icon name="local_shipping" />
            </q-item-section>
            <q-item-section>
              <q-item-label>
                {{ newIntervention.véhicule.type }}
                <q-badge
                  color="black"
                  :label="newIntervention.véhicule.numéro"
                />
              </q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-badge
                color="red"
                :label="newIntervention.rôle"
              />
            </q-item-section>
          </template>
          <q-input
            v-model="newIntervention.véhicule.type"
            label="Véhicule"
            outlined
          >
            <template v-slot:before>
              <q-icon name="local_shipping" />
            </template>
          </q-input>
          <q-input
            v-model="newIntervention.rôle"
            label="Rôle"
            outlined
          >
            <template
              v-slot:before
              foo
            >
              <q-icon name="person" />
            </template>
          </q-input>
        </q-expansion-item>
        <q-separator spaced />
        <q-item class="q-pa-none">
          <q-item-section avatar>
            <q-icon name="notes" />
          </q-item-section>
          <q-item-section>
            <q-input
              v-model="newIntervention.remarques"
              autogrow
              label="Remarques"
              borderless
            />
          </q-item-section>
        </q-item>
        <q-separator spaced />
        <q-item class="q-pa-none">
          <q-item-section avatar>
            <q-icon name="label" />
          </q-item-section>
          <q-item-section>
            <q-select
              v-model="newIntervention.tags"
              label="Tags"
              borderless
              use-input
              use-chips
              multiple
              input-debounce="0"
              new-value-mode="add"
            />
          </q-item-section>
        </q-item>
      </q-list>
    </q-card-section>
    <q-card-section class="row flex-center">
      <q-btn
        :loading="loading"
        color="red-1"
        text-color="red-7"
        icon="save"
        unelevated
        label="sauvegarder"
        @click="simulateProgress"
      />
    </q-card-section>
  </q-card>
</template>

<script>
import { defineComponent, reactive, ref } from '@vue/composition-api'
import { date, Notify } from 'quasar'

export default defineComponent({
  name: 'NewIntervention',
  props: {
    searchResult: {
      type: Object,
      default: () => {},
    },
  },
  setup({ searchResult }, { emit }) {
    const loading = ref(false)
    const qDateProxy = ref()

    const newIntervention = reactive({
      type: 'Feature',
      geometry: searchResult.geometry,
      date: {
        dateTime: date.formatDate(Date.now(), 'YYYY/MM/DD'),
        garde: {
          id: '',
          caserne: {
            name: 'Caserne 1',
            color: 'red',
          },
          start: date.formatDate(Date.now(), 'YYYY/MM/DD'),
          end: date.formatDate(Date.now(), 'YYYY/MM/DD'),
      },
      },
      évènement: [
        'Incendie',
        'Bâtiment',
        'Appartement',
      ],
      adresse: {
        street: null,
        number: null,
        label: searchResult.place_name.split(',')[0],
        municipality: searchResult.context[1].text,
        locality: null,
      },
      véhicule: {
        type: 'Auto pompe',
        numéro: 14,
      },
      rôle: 2,
      remarques: '',
      tags: [
        'ARI',
        "Feu à l'attaque",
      ],
    })

    const simulateProgress = () => {
      loading.value = true
      setTimeout(() => {
        loading.value = false

        Notify.create('Intervention sauvegardée 👌')
      }, 500)
    }

    const onDateInput = () => qDateProxy.value.hide()

    return {
      loading,
      newIntervention,
      simulateProgress,
      onDateInput,
      qDateProxy,
      emit,
    }
  },
})
</script>

<style></style>
