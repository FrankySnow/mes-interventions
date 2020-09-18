<template>
  <q-page class="flex flex-center">
    <div class="absolute-full">
      <mapbox-map
        :access-token="token"
        map-style="mapbox://styles/frankysnow/ck9yrtmum04rv1ipbjlk6ysvy/draft?optimize=true"
        :center="[6.141, 46.202]"
        :attribution-control="false"
        :zoom="12"
        class="fit"
        @mb-created="mapInstance => (map = mapInstance)"
      >
        <mapbox-geocoder
          position="top-right"
          :options="{
            bbox: [5.89, 46.11, 6.32, 46.37],
            collapsed: true,
            types: 'address',
          }"
          :marker="false"
          @mb-result="onGeocoderResult"
        />
        <mapbox-marker
          :lng-lat="searchResultLngLat"
          v-if="showSearchResultMarker"
          color="gold"
        />
        <mapbox-navigation-control
          position="top-right"
          :visualizePitch="true"
        />
        <mapbox-geolocate-control
          :positionOptions="{
            enableHighAccuracy: true,
          }"
          :trackUserLocation="true"
          :showAccuracyCircle="false"
        />
        <!-- <q-dialog
        v-model="bottomDialog"
        position="bottom"
        seamless
      >
      </q-dialog> -->
      </mapbox-map>
    </div>
  </q-page>
</template>

<script>
import {
  MapboxMap,
  MapboxNavigationControl,
  MapboxGeocoder,
  MapboxMarker,
} from '@studiometa/vue-mapbox-gl'
import MapboxGeolocateControl from '@studiometa/vue-mapbox-gl/src/components/MapboxGeolocateControl.vue' // FIXME: component not exported in the build
import 'mapbox-gl/dist/mapbox-gl.css'
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css'

export default {
  name: 'Carte',
  components: {
    MapboxMap,
    MapboxNavigationControl,
    MapboxGeolocateControl,
    MapboxGeocoder,
    MapboxMarker,
  },
  data() {
    return {
      token: process.env.MAPBOX_ACCESS_TOKEN,
      map: null,
      searchResultLngLat: null,
      showSearchResultMarker: false,
    }
  },
  methods: {
    async onGeocoderResult(e) {
      this.showSearchResultMarker = true
      this.searchResultLngLat = e.result.center
      // Nécessaire pour que flyTo() démarre après l'insertion du Marker
      await this.$nextTick()
      this.map.flyTo({
        center: e.result.center,
        zoom: 17,
      })
    },
  },
}
</script>

<style lang="stylus">
.mapboxgl-ctrl > a.mapboxgl-ctrl-logo
  display: none
</style>
