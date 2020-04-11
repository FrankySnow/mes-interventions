<template>
  <q-layout view="hHh lpR fFf">
    <q-page-container>
      <transition name="fade" mode="out-in">
        <keep-alive>
          <router-view />
        </keep-alive>
      </transition>
    </q-page-container>

    <q-footer elevated class="bg-red-8 text-white">
      <q-tabs
        v-model="tab"
        no-caps
        :dense="!$q.platform.is.desktop"
        indicator-color="transparent"
        :inline-label="$q.platform.is.desktop"
      >
        <q-route-tab
          name="carte"
          label="Carte"
          to="carte"
          icon="map"
          class="col-4"
        />
        <q-route-tab
          name="calendrier"
          label="Calendrier"
          to="calendrier"
          icon="calendar_view_day"
          class="col-4"
        />
        <q-route-tab
          name="statistiques"
          label="Statistiques"
          to="statistiques"
          icon="bar_chart"
          class="col-4"
        />
      </q-tabs>
    </q-footer>
  </q-layout>
</template>

<script>
export default {
  name: 'MainLayout',

  data() {
    return {
      tab: 'carte',
    }
  },
}
</script>

<style>
.q-tab__label {
  font-size: 12px;
  font-weight: 200;
}

.q-tab--inactive {
  opacity: 0.5;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}
</style>
