<template>
  <div id="q-app">
    <router-view />
  </div>
</template>

<script >
import { useMachine } from '@xstate/vue'
import { provide } from '@vue/composition-api'

import interventionsMachine from './machines/interventions'

export default {
  name: 'App',
  setup() {
    const interventionsService = useMachine(interventionsMachine, {
      devTools: true,
    })

    provide('interventionsService', interventionsService)
  },
}
</script>
