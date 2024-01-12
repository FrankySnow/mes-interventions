<script setup lang="ts">
import { date, useQuasar } from 'quasar'
import { reactive, ref } from 'vue'
import { collection, addDoc, getFirestore, Timestamp, DocumentData } from 'firebase/firestore'
import { app } from 'boot/firebase'
import { useFirestore } from '@vueuse/firebase'

const { notify } = useQuasar()

const db = getFirestore(app)
const collectionRef = collection(db, 'interventions')

type DocData = {
  datetime: string,
  adresse: string,
  évènement: string,
  véhicule: string,
  rôle: string,
  remarques: string,
}

const formValues = reactive<DocData>({
  datetime: date.formatDate(Date.now(), 'YYYY-MM-DD'),
  adresse: '',
  évènement: '',
  véhicule: '',
  rôle: '',
  remarques: '',
})

const interventions = useFirestore(collectionRef)
const loading = ref(false)
const dialog = ref(false)
const interventionDetail = ref(false)
const interventionSelected = ref<DocumentData>()
const qDateProxy = ref()

const submit = async () => {
  loading.value = true
  try {
    const docRef = await addDoc(collectionRef, {
      ...formValues,
      created_at: Timestamp.now(),
      datetime: Timestamp.fromMillis(Date.parse(formValues.datetime)),
    })
    console.log(docRef.id)
    notify({
      message: `C'est sauvegardé 🔥 : ${docRef.id}`,
      type: 'positive',
    })
  } catch (error) {
    notify({
      message: `Erreur : ${error}`,
      type: 'negative',
    })
  }
  loading.value = false
}
</script>

<template>
  <q-page class="col q-pa-sm">
    <q-list
      separator
    >
      <q-item
        v-for="intervention in interventions"
        :key="intervention.id"
        v-ripple
        clickable
        @click="(interventionSelected = intervention) && (interventionDetail = true)"
      >
        <q-item-section>
          <q-item-label>{{ intervention.évènement }}</q-item-label>
          <q-item-label
            caption
          >
            {{ intervention.adresse }}
          </q-item-label>
        </q-item-section>

        <q-item-section
          side
        >
          <q-item-label caption>
            {{ intervention.rôle }}
          </q-item-label>
          <q-item-label caption>
            {{ intervention.véhicule }}
          </q-item-label>
        </q-item-section>
      </q-item>
    </q-list>
    <q-dialog v-model="dialog">
      <q-card class="col q-gutter-md q-ma-none q-px-md q-pb-md">
        <q-input
          v-model="formValues.datetime"
          label="Date"
          outlined
        >
          <template #before>
            <q-icon name="event" />
          </template>
          <template #append>
            <q-icon
              name="edit"
              class="cursor-pointer"
            >
              <q-popup-proxy
                ref="qDateProxy"
                transition-show="scale"
                transition-hide="scale"
              >
                <q-date
                  v-model="formValues.datetime"
                  mask="YYYY-MM-DD"
                  @update:model-value="() => qDateProxy.hide()"
                />
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>
        <q-input
          v-model="formValues.adresse"
          label="Adresse"
          outlined
        >
          <template #before>
            <q-icon name="place" />
          </template>
        </q-input>
        <q-input
          v-model="formValues.évènement"
          label="Évènement"
          outlined
        >
          <template #before>
            <q-icon name="fireplace" />
          </template>
        </q-input>
        <q-input
          v-model="formValues.véhicule"
          label="Véhicule"
          outlined
        >
          <template #before>
            <q-icon name="local_shipping" />
          </template>
        </q-input>
        <q-input
          v-model="formValues.rôle"
          label="Rôle"
          outlined
        >
          <template #before>
            <q-icon name="person" />
          </template>
        </q-input>
        <q-input
          v-model="formValues.remarques"
          type="textarea"
          label="Remarques"
          rows="3"
          outlined
        >
          <template #before>
            <q-icon name="notes" />
          </template>
        </q-input>
        <div class="row">
          <q-btn
            :loading="loading"
            color="primary"
            label="sauvegarder"
            class="full-width"
            @click="submit"
          />
        </div>
      </q-card>
    </q-dialog>
    <q-dialog v-model="interventionDetail">
      <q-card class="">
        <q-img src="https://images.unsplash.com/photo-1518904868869-fbb2cdd0429a?q=80&w=265&auto=format" />

        <q-card-section>
          <q-btn
            fab
            color="primary"
            icon="place"
            class="absolute"
            style="top: 0; right: 12px; transform: translateY(-50%);"
          />

          <div class="row items-center">
            <div class="col text-h6 ellipsis">
              {{ interventionSelected?.évènement }}
            </div>
            <div class="col-auto text-grey text-caption q-pt-md row no-wrap items-center">
              {{ interventionSelected?.rôle }}
            </div>
          </div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <div class="text-subtitle1">
            {{ interventionSelected?.adresse }}
          </div>
          <div class="text-caption text-grey">
            {{ interventionSelected?.remarques }}
          </div>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right">
          <q-btn
            v-close-popup
            flat
            color="primary"
            label="Fermer"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-page-sticky
      position="bottom-right"
      :offset="[18, 18]"
    >
      <q-btn
        fab
        icon="add"
        color="primary"
        @click="dialog=true"
      />
    </q-page-sticky>
  </q-page>
</template>
