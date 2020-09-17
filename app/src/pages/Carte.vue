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
      >
        <mapbox-geocoder
          position="top-right"
          :options="{
            bbox: [5.89, 46.11, 6.32, 46.37],
            collapsed: true,
            marker: {
              color: 'gold',
              // draggable: true,
              // TODO: access marker to implement dragging interaction
            },
            types: 'address',
          }"
        />
        <mapbox-navigation-control
          position="top-right"
          :visualizePitch="true"
        />
      </mapbox-map>
    </div>
  </q-page>
</template>

<script>
import {
  MapboxMap,
  MapboxNavigationControl,
  MapboxGeocoder,
} from '@studiometa/vue-mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css'

export default {
  name: 'Calendrier',
  components: {
    MapboxMap,
    MapboxNavigationControl,
    MapboxGeocoder,
  },
  data() {
    return {
      token: process.env.MAPBOX_ACCESS_TOKEN,
    }
  },
}
</script>

<style lang="stylus">
.mapboxgl-ctrl > a.mapboxgl-ctrl-logo
  display: none
</style>
