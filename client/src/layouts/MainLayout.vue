<script setup lang="ts">
import { ref } from 'vue'

const tab = ref()
</script>

<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
      <router-view />
    </q-page-container>

    <q-footer
      elevated
      class="bg-red-8 text-white"
    >
      <q-tabs
        v-model="tab"
        no-caps
        :dense="!$q.platform.is.desktop"
        indicator-color="transparent"
        :inline-label="$q.platform.is.desktop"
        class="footer-tabs"
      >
        <q-route-tab
          name="liste"
          label="Liste"
          to="/"
          icon="calendar_view_day"
          class="col-3"
        />
        <q-route-tab
          name="carte"
          label="Carte"
          to="map"
          icon="map"
          class="col-3"
        />
        <q-route-tab
          name="stats"
          label="Stats"
          to="stats"
          icon="bar_chart"
          class="col-3"
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
  font-weight: 200;
}

:deep(.q-tab--inactive) {
  opacity: 0.5;
}</style>
