<template>
  <q-page class="flex flex-center">
    <q-drawer
      v-model="rightDrawer"
      :width="200"
      behavior="mobile"
      side="right"
      bordered
      elevated
      content-class="bg-grey-3"
    >
      <q-list>
        <q-item-label header>
          Debugging
        </q-item-label>

        <q-item v-ripple>
          <q-item-section>
            <q-item-label>Show padding</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-toggle
              v-model="showPadding"
              checked-icon="check"
              unchecked-icon="clear"
              color="green"
            />
          </q-item-section>
        </q-item>

        <q-item>
          <q-item-section>
            <q-item-label>Clear storage</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-btn v-ripple icon="delete" unelevated>
              <q-menu>
                <q-btn
                  v-ripple
                  v-close-popup
                  color="red"
                  icon="warning"
                  @click="clearStorage"
                />
              </q-menu>
            </q-btn>
          </q-item-section>
        </q-item>

        <q-separator spaced />
      </q-list>
    </q-drawer>
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
              'circle-color': 'white',
              'circle-radius': 4,
              'circle-stroke-width': 4,
              'circle-stroke-color': 'gold',
            },
          }"
        />
      </mapbox-map>
      <q-dialog
        ref="bottomDialog"
        :value="bottomDialogState.matches('visible')"
        position="bottom"
        :seamless="!isAddressSelected"
        @hide="
          () => {
            isAddressSelected = false
            showSearchResultMarker = false
          }
        "
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
import { Machine, interpret } from 'xstate'

import SearchResult from '../components/SearchResult.vue'
import NewIntervention from '../components/NewIntervention.vue'

const bottomDialogMachine = Machine({
  id: 'bottomDialogMachine',
  initial: 'hidden',
  states: {
    hidden: {
      on: {
        SHOW: 'visible',
      },
    },
    visible: {
      on: {
        HIDE: 'hidden',
      },
    },
  },
  strict: true,
})

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
      isAddressSelected: false,
      interventionsData: (() =>
        this.$q.sessionStorage.getItem('interventionsData') || {
          type: 'FeatureCollection',
          features: [],
        })(),
      rightDrawer: false,
      showPadding: false,
      bottomDialogService: interpret(bottomDialogMachine),
      bottomDialogState: bottomDialogMachine.initialState,
    }
  },
  watch: {
    showPadding(state) {
      this.map.showPadding = state
    },
  },
  created() {
    this.bottomDialogService
      .onTransition(newState => {
        this.bottomDialogState = newState
      })
      .start()
  },
  methods: {
    onMapCreated(mapInstance) {
      this.map = mapInstance // ⚠️ propriété non réactive
      this.mapPromisified = promisify(mapInstance) // ⚠️ propriété non réactive
      this.map.showPadding = this.showPadding
      this.map.setPadding({
        top: 60,
      })
    },
    async onGeocoderResult(event) {
      this.showSearchResultMarker = true
      this.searchResult = event.result
      this.bottomDialogService.send('SHOW')

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
      this.bottomDialogService.send('HIDE')
    },
    clearStorage(/* event */) {
      this.$q.sessionStorage.remove('interventionsData')
      this.interventionsData = {
        type: 'FeatureCollection',
        features: [],
      }
    },
  },
}
</script>

<style lang="stylus">
.mapboxgl-ctrl > a.mapboxgl-ctrl-logo
  display: none
.q-drawer__opener
  width: 30px
</style>
