<script setup lang="ts">
import { useFirestore } from '@vueuse/firebase'
import { db } from 'boot/firebase'
import { collection } from 'firebase/firestore'

const collectionRef = collection(db, 'interventions')

const interventions = useFirestore(collectionRef)
</script>

<template>
  <q-page class="col q-pa-md bg-red-1">
    <q-list
      separator
      class="bg-white rounded-borders"
    >
      <q-item-label header>
        {{ !interventions || interventions.length == 0 ? `Aucune` : interventions.length }} intervention{{ interventions && interventions.length > 1 ? 's' : '' }}
      </q-item-label>
      <q-item
        v-for="intervention in interventions"
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
