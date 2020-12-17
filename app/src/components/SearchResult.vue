<template>
  <q-card>
    <q-bar
      class="bg-white"
      style="border-bottom: 1px solid rgba(0,0,0,0.12)"
    >
      <q-space />
      <q-btn
        v-close-popup
        icon="close"
        flat
        round
        dense
        text-color="grey-7"
      />
    </q-bar>
    <q-card-section class="q-pt-sm">
      <q-list>
        <q-item class="">
          <q-item-section avatar>
            <q-icon
              name="place"
              color="orange"
            />
          </q-item-section>
          <q-item-section>
            <q-item-label>
              {{ searchResult.place_name.split(',')[0] }}
            </q-item-label>
            <q-item-label caption>
              {{ searchResult.context[1].text }}
            </q-item-label>
          </q-item-section>
        </q-item>
        <!-- <q-separator spaced /> -->
        <q-item-label
          class=""
          header
        >À CETTE ADRESSE</q-item-label>
        <q-item>
          <q-item-section avatar>
            <q-icon
              name="add"
              color="red"
            />
          </q-item-section>
          <q-item-section>
            <q-btn
              color="red-1"
              text-color="red-7"
              label="Ajouter intervention"
              size=""
              unelevated
              @click="$emit('addressSelected')"
            />
          </q-item-section>
        </q-item>
      </q-list>
    </q-card-section>
  </q-card>
</template>

<script>
export default {
  props: {
    searchResult: {
      type: Object,
      default: () => ({}),
    }
  },
}
</script>

<style></style>
