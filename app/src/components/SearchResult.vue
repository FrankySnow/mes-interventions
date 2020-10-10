<template>
  <q-card>
    <q-card-section>
      <div class="row no-wrap items-center">
        <div class="col text-subtitle1">
          {{ searchResult.place_name }}
        </div>
      </div>
    </q-card-section>

    <q-separator />

    <q-card-actions align="right">
      <q-btn
        v-close-popup
        flat
        color="gray"
        label="Annuler"
      />
      <q-btn
        flat
        color="red"
        label="Créer intervention"
        @click="$emit('addressSelected')"
      />
    </q-card-actions>
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
