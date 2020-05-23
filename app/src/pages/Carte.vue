<template>
  <q-page class="flex flex-center">
    <div class="absolute-full">
      <div ref="map" class="fit" @contextmenu="log"></div>
      <q-page-sticky
        position="bottom-right"
        :offset="[18, 18]"
      >
        <q-btn
          fab
          icon="add"
          color="red"
          @click="openDialog"
        />
      </q-page-sticky>
      <q-dialog v-model="dialog" position="bottom" seamless>
        <q-resize-observer
          @resize="e => (dialogHeight = e.height)"
        />
        <nouvelle-intervention />
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
      dialogHeight: 0,
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
    })
      .on('result', result => {
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
  },
  methods: {
    log: e => console.log(e),
    openDialog() {
      this.dialog = true
      this.map.easeTo({
        padding: {
          bottom: 300,
        },
      })
    },
    closeDialog() {
      this.dialog = false
      this.map.easeTo({
        padding: {
          bottom: 0,
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
