<template>
  <q-page class="flex flex-center">
    <div class="absolute-full">
      <div ref="map" class="fit"></div>
    </div>
  </q-page>
</template>

<script>
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

mapboxgl.accessToken = process.env.MAPBOX_ACCESS_TOKEN
const Genève = [6.141, 46.202]

export default {
  name: 'Carte',
  data() {
    return {
      map: null,
    }
  },
  mounted() {
    const geolocateControl = new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true,
      },
      trackUserLocation: true,
    })

    const navigateControl = new mapboxgl.NavigationControl({
      visualizePitch: true,
      showZoom: true,
      showCompass: true,
    })

    const mapOptions = {
      container: this.$refs.map,
      style:
        'mapbox://styles/frankysnow/ck9yrtmum04rv1ipbjlk6ysvy/draft',
      center: Genève,
      zoom: 12,
      attributionControl: false,
    }

    this.map = new mapboxgl.Map(mapOptions)
      .addControl(geolocateControl, 'top-left')
      .addControl(navigateControl, 'top-right')
      .on('load', () => geolocateControl.trigger())
  },
  methods: {},
}
</script>
