<script setup lang="ts">
import { useAuthActor } from 'boot/auth'
import { ref } from 'vue'

const { matches } = useAuthActor()

const isAuthenticated = matches('Authenticated')
const tab = ref('liste')
</script>

<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
      <router-view />
    </q-page-container>

    <q-footer
      bordered
      class="bg-white text-grey-7"
    >
      <q-tabs
        v-model="tab"
        no-caps
        :dense="!$q.platform.is.desktop"
        indicator-color="transparent"
        :inline-label="$q.platform.is.desktop"
        active-color="red-7"
      >
        <q-route-tab
          name="liste"
          label="Liste"
          to="/"
          icon="calendar_view_day"
          class="col-3"
          :disable="!isAuthenticated"
        />
        <q-route-tab
          name="carte"
          label="Carte"
          to="map"
          icon="map"
          class="col-3"
          :disable="!isAuthenticated"
        />
        <q-route-tab
          name="stats"
          label="Stats"
          to="stats"
          icon="bar_chart"
          class="col-3"
          :disable="!isAuthenticated"
        />
        <q-route-tab
          name="profil"
          label="Profil"
          to="profil"
          icon="person"
          class="col-3"
        />
      </q-tabs>
    </q-footer>
  </q-layout>
</template>

<style scoped>
:deep(.q-tab__label) {
  font-size: 12px;
  font-weight: 300;
  letter-spacing: 0.8px;
}

:deep(.q-tab--inactive) {
  opacity: 0.9;
}

:deep(.q-tab--active .q-tab__label) {
  font-weight: 600;
}</style>
