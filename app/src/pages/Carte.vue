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
        <q-dialog
          ref="bottomDialog"
          v-model="showSearchResultDialog"
          position="bottom"
          :seamless="!isAddressSelected"
          @hide="isAddressSelected = false"
          @before-hide="onDialogResize"
        >
          <q-resize-observer @resize="onDialogResize" />
          <search-result
            v-if="!isAddressSelected"
            :search-result="searchResult"
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
import SearchResult from 'components/SearchResult.vue'
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css'
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
      initialCenter: [6.141, 46.202],
      searchResult: null,
      showSearchResultMarker: false,
      showSearchResultDialog: false,
      isAddressSelected: false,
      isMapInteractive: true,
    }
  },
  methods: {
    onMapCreated(mapInstance) {
      this.map = mapInstance // ⚠️ propriété non réactive
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
       * # 😠 Problème
       * Lorsqu'un résultat du geocoder est sélectionné sur mobile, le clavier virtuel disparaît
       * ce qui émet un resize via le ResizeObserver (2 pour être précis).
       * Le flyTo qui est déclenché calcule la position de la caméra sur la base du
       * viewport réduit par le clavier virtuel avant le resize, et ne corrige pas cette position.
       * La caméra arrive donc à destination avec un décalage correspondant à ~ la moitié de la hauteur
       * du clavier virtuel.
       *
       * # 💡 Pistes explorées
       * 1. empêcher le clavier virtuel de disparaître immédiatement => mauvaise UX, difficile à maintenir
       * 2. détecter l'apparition du clavier virtuel en amont
       *    - si un resize est émis à <200ms du focus sur un input => difficile à maintenir & garantir
       *    - en détectant la plateforme => foireux (émulation sur devtools impossible)
       * 3. lancer le flyTo après le resize ou max ~250ms si pas de resize (desktop...)
       * 4. empêcher la réduction du viewport ? => impossible
       * 5. détecter le resize en cours par un movestart/move/moveend ?
       * 6. interrompre le flyTo lors du resize
       *
       * # 😃 Solution
       * ## mix des pistes 3/5/6 :
       * - On lance le flyTo et si un resize arrive avant la fin, on relance le flyTo qui aura
       * cette fois calculé les bonnes coordonnées.
       * - On doit impérativement détacher les écouteurs d'évènement à la fin de l'animation.
       * - Pour savoir si l'animation est terminée, le `moveend` ne suffit pas car un `moveend` est émis
       * après chaque resize.
       * - On doit donc vérifier si le centre de la map correspond aux coordonnées attendues.
       *
       */
      const onMoveEnd = () => {
        const POSITION_TOLERANCE = 0.001
        const { lng, lat } = this.map.getCenter()
        const [expectedLng, expectedLat] = options.center
        if (
          Math.abs(lng - expectedLng) < POSITION_TOLERANCE
        &&
          Math.abs(lat - expectedLat) < POSITION_TOLERANCE
        ) {
          this.map.off('resize', flyTo)
          this.map.off('moveend', onMoveEnd)
        }
      }
      
      const flyTo = () => this.map.flyTo(options)

      flyTo()
        .on('resize', flyTo)
        .on('moveend', onMoveEnd)
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
        bottom: bottom,
      })
    },
  },
}
</script>

<style lang="stylus">
.mapboxgl-ctrl > a.mapboxgl-ctrl-logo
  display: none
</style>
