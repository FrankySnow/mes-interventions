<template>
  <q-page class="flex flex-center">
    <div class="absolute-full">
      <div ref="map" class="fit" @contextmenu="log"></div>
      <q-dialog
        v-model="dialog"
        position="bottom"
        seamless
        @before-hide="onDialogResize"
      >
        <q-resize-observer @resize="onDialogResize" />
        <nouvelle-intervention
          v-intersection="intersectionOptions"
        />
      </q-dialog>
    </div>
  </q-page>
</template>

<script>
import mapboxgl, {
  createMapboxGeocoder,
} from 'boot/mapboxgl'
import NouvelleIntervention from 'components/NouvelleIntervention.vue'

export default {
  name: 'Carte',
  components: {
    NouvelleIntervention,
  },
  data() {
    return {
      map: null,
      dialog: false,
      Genève: [6.141, 46.202],
      intersectionOptions: {
        handler: event =>
          console.log(event.intersectionRect.height),
        cfg: {
          threshold: [0, 0.5, 1],
        },
      },
    }
  },
  mounted() {
    const geolocateControl = new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true,
      },
      trackUserLocation: true,
      showAccuracyCircle: false,
    })

    const navigateControl = new mapboxgl.NavigationControl({
      visualizePitch: true,
      showZoom: true,
      showCompass: true,
    })

    const mapOptions = {
      container: this.$refs.map,
      style:
        'mapbox://styles/frankysnow/ck9yrtmum04rv1ipbjlk6ysvy/draft?optimize=true',
      center: this.Genève,
      zoom: 12,
      attributionControl: false,
    }

    let searchResultDialog = null
    const geocoderControl = createMapboxGeocoder({
      bbox: [5.89, 46.11, 6.32, 46.37],
      collapsed: true,
      marker: {
        color: 'gold',
        draggable: true,
      },
      types: 'address',
      // flyTo: false,
    })
      .on('result', result => {
        console.log(this.map.isMoving())
        geocoderControl.mapMarker.on('dragend', e => {
          this.map.easeTo({
            center: e.target._lngLat,
          })
          // geocoderControl.setInput(e.target._lngLat.lng)
        })

        if (searchResultDialog) searchResultDialog.hide()
        searchResultDialog = this.$q.dialog({
          title: result.result.place_name,
          message: result.result.center.join(', '),
          position: 'bottom',
          seamless: true,
          ok: false,
        })
      })
      .on(
        'clear',
        () =>
          searchResultDialog &&
          searchResultDialog.hide() &&
          (searchResultDialog = null)
      )

    this.map = new mapboxgl.Map(mapOptions)
      .addControl(geocoderControl, 'top-right')
      .addControl(navigateControl, 'top-right')
      .addControl(geolocateControl, 'top-right')
      .on('load', () => geolocateControl.trigger())

    /**
     * Évènement LAYOUT_RESIZED émis par MainLayout
     * Fixe un bug lors de l'affichage du clavier virtuel
     * ou de la rotation d'écran sur mobile :
     * le canvas Mapbox n'est pas mis à jour à temps
     */
    this.$root.$on('LAYOUT_RESIZED', e => {
      /**
       * si un flyTo ou panTo est en cours
       * (sélection d'un résultat de recherche par exemple)
       */
      if (this.map.isMoving()) {
        this.map.once('moveend', e => this.map.resize())
      } else {
        this.map.resize()
      }
      console.debug('map resized') // FIXME: only in debug mode
    })
    this.map.showPadding = true // FIXME: only in debug mode
  },
  methods: {
    log: e => console.log(e),
    openDialog() {
      this.dialog = true
    },
    closeDialog() {
      this.dialog = false
    },
    onDialogResize(e) {
      let height = e?.height ?? 0 // pas d'évènement resize quand on ferme le Dialog
      let bottom = Math.max(height - 50, 0)
      console.log(height)
      this.map.easeTo({
        padding: {
          bottom: bottom,
        },
      })
    },
  },
  watch: {
    /**
     * Quick and dirty hack : on observe la variable `dialog` pour détecter
     * indirectement quand le Dialog est fermé au lieu d'écouter un évènement
     */
    dialog(bool) {
      if (!bool) this.closeDialog()
    },
  },
}
</script>

<style lang="stylus">
a.mapboxgl-ctrl-logo
  display: none

.mapboxgl-user-location-dot, .mapboxgl-user-location-dot::before
  background-color: gold
</style>
