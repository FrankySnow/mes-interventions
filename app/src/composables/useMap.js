import { provide, inject, ref } from '@vue/composition-api'
import promisify from 'map-promisified'

const MAP_CONTEXT = Symbol('Map context')

export function useMapProvider() {
  const map = ref()
  const mapPromisified = ref()

  const assignMap = (instance) => {
    map.value = instance
    mapPromisified.value = promisify(instance)

    return {
      map,
      mapPromisified,
    }
  }

  provide(MAP_CONTEXT, {
    map,
    mapPromisified,
  })

  return {
    assignMap,
  }
}

export function useMapContext() {
  const context = inject(MAP_CONTEXT)

  if (!context) {
    throw new Error('useMapContext must be used with useMapProvider')
  }

  return context
}
