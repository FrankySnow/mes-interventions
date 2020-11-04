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
      <debug-panel :map-key="mapKey" :data-key="dataKey" />
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
          @mb-loading="mapService.send('SEARCH')"
        />
        <mapbox-marker
          v-if="
            mapState.matches('searchResult') ||
              mapState.matches('newIntervention')
          "
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
        :value="
          mapState.matches('searchResult') ||
            mapState.matches('newIntervention')
        "
        position="bottom"
        :seamless="mapState.matches('searchResult')"
        @hide="mapService.send('HIDE')"
        @before-hide="onDialogResize"
      >
        <q-resize-observer @resize="onDialogResize" />
        <search-result
          v-if="mapState.matches('searchResult')"
          :search-result="searchResult"
          @addressSelected="mapService.send('SELECT_ADDRESS')"
        />
        <new-intervention
          v-if="mapState.matches('newIntervention')"
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
import { defineComponent, nextTick, provide, ref } from '@vue/composition-api'
import { Platform, SessionStorage } from 'quasar'

import SearchResult from '../components/SearchResult.vue'
import NewIntervention from '../components/NewIntervention.vue'
import DebugPanel from '../components/DebugPanel.vue'

const mapMachine = Machine({
  id: 'mapMachine',
  initial: 'hidden',
  states: {
    hidden: {
      on: {
        SHOW: 'searchResult',
        SEARCH: 'searching',
      },
    },
    searching: {
      on: {
        SHOW: 'searchResult',
        HIDE: 'hidden',
      },
    },
    searchResult: {
      on: {
        HIDE: 'hidden',
        SEARCH: 'searching',
        SELECT_ADDRESS: 'newIntervention',
      },
    },
    newIntervention: {
      on: {
        SAVE: 'hidden',
        HIDE: 'hidden',
        SEARCH: 'searching',
      },
    },
  },
  strict: true,
})

export default defineComponent({
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
    DebugPanel,
  },
  setup() {
    const rightDrawer = ref(false)
    const showPadding = ref(false)
    const token = process.env.MAPBOX_ACCESS_TOKEN
    const initialCenter = [6.141, 46.202]
    const map = ref(null)
    const mapPromisified = ref(null)
    const searchResult = ref(null)
    const interventionsData = ref(null)

    const mapKey = Symbol('mapKey')
    provide(mapKey, map)

    const dataKey = Symbol('dataKey')
    provide(dataKey, interventionsData)

    /**
     * Map instance
     */
    const onMapCreated = (mapInstance) => {
      map.value = mapInstance
      mapPromisified.value = promisify(mapInstance)
      map.value.showPadding = showPadding.value
      map.value.setPadding({
        top: 60,
      })
    }
    /**
     * XState
     */
    const mapService = ref(interpret(mapMachine, { devTools: true }))

    const mapState = ref(mapMachine.initialState)

    mapService.value
      .onTransition((newState) => {
        mapState.value = newState
      })
      .start()

    /**
     * Store
     */
    interventionsData.value = SessionStorage.getItem('interventionsData') ?? {
      type: 'FeatureCollection',
      features: [],
    }

    const onInterventionSaved = (adresse) => {
      interventionsData.value.features.push(adresse)
      SessionStorage.set('interventionsData', interventionsData.value)
      mapService.value.send('HIDE')
    }

    /**
     * Geocoder
     */
    const onGeocoderResult = async (event) => {
      searchResult.value = event.result
      mapService.value.send('SHOW')

      /**
       * Permet de mettre à jour le DOM (insérer le Marker) avant de démarrer le flyTo
       */
      await nextTick()

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
        await mapPromisified.value.flyTo(options)
        if (!map.value.isMoving()) {
          map.value.off('resize', flyToAndThenRemoveListener)
        }
      }

      map.value.on('resize', flyToAndThenRemoveListener)
      await flyToAndThenRemoveListener()
    }

    /**
     * Bottom dialog
     */
    const onDialogResize = async (event) => {
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
      const footerHeight = Platform.is.desktop ? 48 : 52

      const bottom = Math.max(dialogHeight - footerHeight, 0)

      map.value.setPadding({
        bottom,
      })
    }

    return {
      mapKey,
      dataKey,
      token,
      initialCenter,
      rightDrawer,
      showPadding,
      onMapCreated,
      searchResult,
      interventionsData,
      mapService,
      mapState,
      onInterventionSaved,
      onGeocoderResult,
      onDialogResize,
    }
  },
})
</script>

<style lang="stylus">
.mapboxgl-ctrl > a.mapboxgl-ctrl-logo
  display: none
.q-drawer__opener
  width: 30px
</style>
