<template>
  <q-page class="flex">
    <div style="flex:auto">
      <l-map
        :zoom="zoom"
        :center="center"
        :options="mapOptions"
        @update:center="centerUpdate"
        @update:zoom="zoomUpdate"
      >
        <l-tile-layer :url="url" />
      </l-map>
    </div>
  </q-page>
</template>

<script>
import L, { latLng } from 'leaflet'
import { LMap, LTileLayer } from 'vue2-leaflet'
import 'leaflet/dist/leaflet.css'

export default {
  name: 'Carte',
  components: {
    LMap,
    LTileLayer,
  },
  data() {
    return {
      zoom: 11,
      center: latLng(46.202, 6.141),
      url:
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution:
        '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
      currentZoom: 11,
      currentCenter: latLng(46.202, 6.141),
      mapOptions: {
        zoomSnap: 1,
      },
    }
  },
  methods: {
    zoomUpdate(zoom) {
      this.currentZoom = zoom
    },
    centerUpdate(center) {
      this.currentCenter = center
    },
  },
}
</script>
