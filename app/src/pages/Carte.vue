<template>
  <q-page class="">
    <div
      style="position: absolute;width: 100%;top: 0;transition:all 200ms linear"
      :style="{
        bottom: Math.max(0, dialogHeight - 55) + 'px',
      }"
    >
      <l-map
        ref="map"
        :zoom="zoom"
        :center="center"
        :options="mapOptions"
        @mousedown="e => (lastClickedPoint = e.latlng)"
        v-touch-hold.mouse="onHold"
      >
        <l-tile-layer :url="url" />
      </l-map>
      <q-dialog v-model="dialog" position="bottom" seamless>
        <q-resize-observer
          @resize="e => (dialogHeight = e.height)"
        />
        <q-card style="height:70vh">
          <q-card-section
            class="row items-center q-pb-none"
          >
            <div class="text-h6">Nouvelle intervention</div>
            <q-space />
            <q-btn
              icon="close"
              flat
              round
              dense
              v-close-popup
            />
          </q-card-section>

          <q-card-section class="q-gutter-md items-center">
            <q-input
              label="Date"
              outlined
              v-model="date"
              mask="date"
            >
              <template v-slot:before>
                <q-icon name="event" />
              </template>
              <template v-slot:append>
                <q-icon name="edit" class="cursor-pointer">
                  <q-popup-proxy
                    ref="qDateProxy"
                    transition-show="scale"
                    transition-hide="scale"
                  >
                    <q-date
                      v-model="date"
                      color="red"
                      @input="() => $refs.qDateProxy.hide()"
                    />
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
            <q-input label="Adresse" outlined>
              <template v-slot:before>
                <q-icon name="place" />
              </template>
            </q-input>
            <q-input label="Critère" outlined>
              <template v-slot:before>
                <q-icon name="fireplace" />
              </template>
            </q-input>
            <q-input label="Véhicule" outlined>
              <template v-slot:before>
                <q-icon name="local_shipping" />
              </template>
            </q-input>
            <q-input label="Rôle" outlined>
              <template v-slot:before>
                <q-icon name="person" />
              </template>
            </q-input>
            <q-input
              type="textarea"
              label="Remarques"
              outlined
            >
              <template v-slot:before>
                <q-icon name="notes" />
              </template>
            </q-input>
            <div class="row">
              <q-btn
                :loading="loading"
                color="red"
                @click="simulateProgress"
                label="sauvegarder"
                class="full-width"
              />
            </div>
          </q-card-section>
        </q-card>
      </q-dialog>
    </div>
  </q-page>
</template>

<script>
import L, { latLng } from 'leaflet'
import { LMap, LTileLayer } from 'vue2-leaflet'
import 'leaflet/dist/leaflet.css'
import { Icon } from 'leaflet'
import { date, Notify } from 'quasar'

delete Icon.Default.prototype._getIconUrl
Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
})

export default {
  name: 'Carte',
  components: {
    LMap,
    LTileLayer,
  },
  data() {
    return {
      zoom: 11,
      center: latLng(46.202, 6.141),
      url:
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution:
        '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
      currentZoom: 11,
      initialCenter: latLng(46.202, 6.141),
      mapOptions: {
        zoomSnap: 1,
      },
      map: null,
      dialog: false,
      lastClickedPoint: null,
      dialogHeight: 0,
      date: date.formatDate(Date.now(), 'YYYY/MM/DD'),
      loading: false,
    }
  },
  async mounted() {
    await this.$nextTick()
    this.map = this.$refs.map.mapObject
  },
  methods: {
    onMarkerClick(center) {
      this.map.panTo(center)
      this.dialog = true
    },
    log: x => console.log(x),
    onHold() {
      const marker = L.marker(this.lastClickedPoint, {
        draggable: true,
      })
      marker.on('click', () => {
        this.dialog = true
        /* on utilise cette méthode au lieu de flyTo() 
        pour pouvoir donner un padding */
        this.map.flyToBounds(
          /* on créé un objet latLngBounds composé 
          d'un seul point pour pouvoir l'avoir au centre */
          L.latLngBounds(
            marker.getLatLng(),
            marker.getLatLng()
          )
          /* on donne un padding équivalent à la hauteur du QDialog
          dont on soustrait un peu plus que la hauteur du footer
          {
            paddingBottomRight: [0, this.dialogHeight - 60],
          }
          */
        )
      })

      marker.addTo(this.map)
      this.map.flyTo(marker.getLatLng(), 18)
    },
    simulateProgress() {
      this.loading = true
      setTimeout(() => {
        let self = this
        self.loading = false
        self.$q.notify(
          "C'est sauvegardé mais pas pour de vrai 🤣"
        )
        self.dialog = false
      }, 2000)
    },
  },
  watch: {
    async dialog(isOpen) {
      if (!isOpen) this.dialogHeight = 0
      setTimeout(() => {
        //   console.log(this.dialogHeight)
        // await this.$nextTick()
        this.map.invalidateSize({
          animate: true,
          //   // duration: 0.1,
        })
      }, 300)
    },
  },
}
</script>
