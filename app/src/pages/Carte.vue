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
        @mb-created="onMapCreated"
      >
        <mapbox-geocoder
          position="top-right"
          :bbox="[5.89, 46.11, 6.32, 46.37]"
          :collapsed="true"
          types="address"
          :marker="false"
          :fly-to="false"
          placeholder="Rechercher..."
          @mb-result="onGeocoderResult"
        />
        <mapbox-marker
          v-if="showSearchResultMarker"
          :lng-lat="searchResult.center"
          color="gold"
        />
        <mapbox-navigation-control
          position="top-right"
          :visualize-pitch="true"
        />
        <mapbox-geolocate-control
          :position-options="{
            enableHighAccuracy: true,
          }"
          :track-user-location="true"
          :show-accuracy-circle="false"
        />
        <mapbox-source
          id="interventionsData"
          :options="{
            type: 'geojson',
            data: interventionsData,
          }"
        />
        <mapbox-layer
          id="interventions"
          :options="{
            source: 'interventionsData',
            type: 'circle',
            paint: {
              'circle-color': 'gold',
              'circle-radius': 5,
              'circle-stroke-width': 1,
            },
          }"
        />
        <q-dialog
          ref="bottomDialog"
          v-model="showSearchResultDialog"
          position="bottom"
          :seamless="!isAddressSelected"
          @hide="() => {
            isAddressSelected = false
            showSearchResultMarker = false
          }"
          @before-hide="onDialogResize"
        >
          <q-resize-observer @resize="onDialogResize" />
          <search-result
            v-if="!isAddressSelected"
            :search-result="searchResult"
            @addressSelected="isAddressSelected = true"
          />
          <new-intervention
            v-if="isAddressSelected"
            :search-result="searchResult"
            @saved="onInterventionSaved"
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
  MapboxSource,
  MapboxLayer,
  MapboxGeolocateControl,
} from '@studiometa/vue-mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css'
import promisify from 'map-promisified'

import SearchResult from '../components/SearchResult.vue'
import NewIntervention from '../components/NewIntervention.vue'

export default {
  name: 'Carte',
  components: {
    MapboxMap,
    MapboxNavigationControl,
    MapboxGeolocateControl,
    MapboxGeocoder,
    MapboxMarker,
    MapboxSource,
    SearchResult,
    MapboxLayer,
    NewIntervention,
  },
  data() {
    return {
      token: process.env.MAPBOX_ACCESS_TOKEN,
      initialCenter: [6.141, 46.202],
      searchResult: null,
      showSearchResultMarker: false,
      showSearchResultDialog: false,
      isAddressSelected: false,
      isMapInteractive: true,
      interventionsData: (() =>
        this.$q.sessionStorage.getItem('interventionsData') || {
          type: 'FeatureCollection',
          features: [],
        })(),
    }
  },
  methods: {
    onMapCreated(mapInstance) {
      this.map = mapInstance // ⚠️ propriété non réactive
      this.mapPromisified = promisify(mapInstance) // ⚠️ propriété non réactive
      this.map.showPadding = process.env.DEV
      this.map.setPadding({
        top: 60,
      })
    },
    async onGeocoderResult(event) {
      this.showSearchResultMarker = true
      this.searchResult = event.result
      this.showSearchResultDialog = true

      /**
       * Permet de mettre à jour le DOM (insérer le Marker) avant de démarrer le flyTo
       */
      await this.$nextTick()

      const options = {
        center: event.result.center,
        zoom: 18,
      }

      /**
       * Lorsqu'un résultat du geocoder est sélectionné sur mobile, le clavier virtuel disparaît
       * ce qui émet un resize via le ResizeObserver (2 pour être précis).
       * Le flyTo qui est déclenché calcule la position de la caméra sur la base du
       * viewport réduit par le clavier virtuel avant le resize, et ne corrige pas cette position.
       * La caméra arrive donc à destination avec un décalage correspondant à ~ la moitié de la hauteur
       * du clavier virtuel.
       *
       * Ceci est un refactoring de la solution du commit précédent faisant appel à map-promisified,
       * ce qui permet d'utiliser une Promise qui se résout à la fin de l'animation qu'elle déclenche
       * (ce qui arrive notamment à chaque resize).
       * Il faut donc vérifier que la map ne soit plus en mouvement pour pouvoir détacher
       * l'écouteur d'évènement.
       */
      const flyToAndThenRemoveListener = async () => {
        await this.mapPromisified.flyTo(options)
        if (!this.map.isMoving()) {
          this.map.off('resize', flyToAndThenRemoveListener)
        }
      }

      this.map.on('resize', flyToAndThenRemoveListener)
      await flyToAndThenRemoveListener()
    },
    async onDialogResize(event) {
      /**
       * Lorsque `onDialogResize` est appelé par `q-dialog@before-hide`,
       * aucun évènement `resize` n'est déclenché et `event === undefined`.
       */
      const dialogHeight = event?.height ?? 0

      /**
       * On doit déduire de la hauteur du Dialog la hauteur du Footer :
       * - 48 px sur desktop
       * - 52 px sur mobile
       */
      const footerHeight = this.$q.platform.is.desktop ? 48 : 52

      const bottom = Math.max(dialogHeight - footerHeight, 0)

      this.map.setPadding({
        bottom,
      })
    },
    onInterventionSaved(adresse) {
      this.interventionsData.features.push(adresse)
      this.$q.sessionStorage.set('interventionsData', this.interventionsData)
      this.$refs.bottomDialog.hide()
    },
  },
}
</script>

<style lang="stylus">
.mapboxgl-ctrl > a.mapboxgl-ctrl-logo
  display: none
</style>
