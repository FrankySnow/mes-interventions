<script setup lang="ts">
import { useInterventions } from 'src/composables/useInterventions'

const { interventions, interventionsCount } = useInterventions()
const { data, pending } = interventions
</script>

<template>
  <q-page class="col q-pa-md bg-grey-2">
    <q-inner-loading
      :showing="pending"
    >
      <q-spinner
        size="50px"
        color="red-6"
      />
    </q-inner-loading>
    <div class="text-subtitle2 text-weight-regular text-grey-7">
      {{ interventionsCount || 'Aucune' }} intervention{{ interventionsCount > 1 ? 's' : '' }}
    </div>
    <q-list
      v-if="interventionsCount"
      separator
      class="bg-white my-border"
    >
      <q-item
        v-for="intervention in data"
        :key="intervention.id"
        v-ripple
        clickable
      >
        <q-item-section>
          <q-item-label>{{ intervention.évènement }}</q-item-label>
          <q-item-label caption>
            {{ intervention.adresse }}
          </q-item-label>
        </q-item-section>

        <q-item-section
          side
        >
          <q-item-label caption>
            {{ intervention.rôle }}
          </q-item-label>
          <q-item-label caption>
            {{ intervention.véhicule }}
          </q-item-label>
        </q-item-section>
      </q-item>
    </q-list>
    <q-page-sticky
      position="bottom-right"
      :offset="[18, 18]"
    >
      <q-btn
        fab
        icon="add"
        color="red-8"
        to="new-intervention"
      />
    </q-page-sticky>
  </q-page>
</template>
