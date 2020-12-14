<template>
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
    <q-slide-item
      ref="slideItem"
      class="bg-grey-3"
      right-color="red"
    >
      <template v-slot:right>
        <q-btn
          v-ripple
          unelevated
          icon="undo"
          @click="() => slideItem.reset()"
        />
        <q-btn
          v-ripple
          unelevated
          icon="warning"
          @click="clearStorage"
        />
      </template>
      <q-item>
        <q-item-section>
          <q-item-label>Clear storage</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-icon name="delete" />
        </q-item-section>
      </q-item>
    </q-slide-item>
    <q-separator spaced />
  </q-list>
</template>

<script>
import { defineComponent, ref, watch } from '@vue/composition-api'
import { Notify } from 'quasar'

import { useMapContext } from '../composables/useMap'

export default defineComponent({
  setup(props, { emit }) {
    const { map } = useMapContext()

    const slideItem = ref(null)
    const showPadding = ref(false)

    watch(showPadding, (state) => {
      map.value.showPadding = state
    })

    const clearStorage = () => {
      emit('clearStorage')
      Notify.create('🗑️ storage cleared')
      slideItem.value.reset()
    }

    return {
      showPadding,
      clearStorage,
      slideItem,
    }
  },
})
</script>

<style></style>
