<template>
  <q-page class="flex flex-center">
    <div class="absolute-full">
      <mapbox-map
        :access-token="token"
        map-style="mapbox://styles/frankysnow/ck9yrtmum04rv1ipbjlk6ysvy/draft?optimize=true"
        :center="initialCenter"
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
          :lng-lat="searchResult.center"
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
        <q-dialog
          v-model="showSearchResultDialog"
          position="bottom"
          :seamless="!isAddressSelected"
          @hide="isAddressSelected = false"
          ref="bottomDialog"
        >
          <search-result
            :searchResult="searchResult"
            v-if="!isAddressSelected"
            @addressSelected="isAddressSelected = true"
          />
          <nouvelle-intervention
            v-if="isAddressSelected"
            :address="searchResult.place_name"
            @saved="() => this.$refs.bottomDialog.hide()"
          />
        </q-dialog>
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
  MapboxGeolocateControl,
} from '@studiometa/vue-mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css'
import SearchResult from 'components/SearchResult.vue'
import NouvelleIntervention from 'components/NouvelleIntervention.vue'

export default {
  name: 'Carte',
  components: {
    MapboxMap,
    MapboxNavigationControl,
    MapboxGeolocateControl,
    MapboxGeocoder,
    MapboxMarker,
    SearchResult,
    NouvelleIntervention,
  },
  data() {
    return {
      token: process.env.MAPBOX_ACCESS_TOKEN,
      map: null,
      initialCenter: [6.141, 46.202],
      searchResult: null,
      showSearchResultMarker: false,
      showSearchResultDialog: false,
      isAddressSelected: false,
      isMapInteractive: true,
    }
  },
  methods: {
    async onGeocoderResult(e) {
      this.showSearchResultMarker = true
      this.searchResult = e.result
      this.showSearchResultDialog = true
      // Nécessaire pour que flyTo() démarre après l'insertion du Marker
      await this.$nextTick()
      this.map.flyTo({
        center: e.result.center,
        zoom: 18,
        pitch: 60,
      })
    },
  },
}
</script>

<style lang="stylus">
.mapboxgl-ctrl > a.mapboxgl-ctrl-logo
  display: none
</style>
