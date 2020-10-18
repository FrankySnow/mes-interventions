<template>
  <q-layout view="hHh lpR fFf">
    <q-page-container>
      <transition
        enter-active-class="animated slideInLeft"
        leave-active-class="animated slideOutRight"
        mode="out-in"
      >
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
          to="/"
          icon="map"
          class="col-4"
          :ripple="{ early: true /** workaround */}"
        />
        <q-route-tab
          name="calendrier"
          label="Calendrier"
          to="calendrier"
          icon="calendar_view_day"
          class="col-4"
          :ripple="{ early: true /** workaround */ }"
        />
        <q-route-tab
          name="statistiques"
          label="Statistiques"
          to="statistiques"
          icon="bar_chart"
          class="col-4"
          :ripple="{ early: true /** workaround */ }"
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
</style>
