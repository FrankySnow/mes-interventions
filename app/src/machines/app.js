import { SessionStorage } from 'quasar'
import { Machine, assign } from 'xstate'

export default Machine(
  {
    strict: true,
    id: 'appMachine',
    initial: 'loading',
    context: {
      searchResult: {
        center: [],
      },
      interventionsData: {
        type: 'FeatureCollection',
        features: [],
      },
    },
    states: {
      loading: {
        entry: ['rehydrateData'],
        always: 'initialized',
      },
      initialized: {
        on: {
          SEARCH: 'searching',
        },
      },
      searching: {
        entry: ['clearSearchResult'],
        on: {
          SELECT_RESULT: {
            actions: ['assignSearchResult'],
            target: 'displaying.result',
            cond: 'isResultValid',
          },
        },
      },
      displaying: {
        on: {
          CANCEL: '#appMachine.initialized',
        },
        states: {
          result: {
            on: {
              COMMIT_RESULT: 'intervention',
              SEARCH: '#appMachine.searching',
            },
          },
          intervention: {
            on: {
              SAVE: {
                actions: [
                  'saveIntervention', 
                  'persistData'
                ],
                target: '#appMachine.initialized',
              },
            },
          },
        },
      },
    },
    on: {
      CLEAR_STORAGE: {
        actions: [
          'clearData',
          'persistData'
        ],
      },
    },
  },
  {
    actions: {
      assignSearchResult: assign({
        searchResult: (ctx, evt) => evt.result,
      }),
      clearSearchResult: assign({
        searchResult: { center: [] },
      }),
      saveIntervention: assign({
        interventionsData: (ctx, evt) => ({
          type: 'FeatureCollection',
          features: [
            ...ctx.interventionsData.features, 
            evt.adresse
          ],
        }),
      }),
      persistData: (ctx) => {
        SessionStorage.set('interventionsData', ctx.interventionsData)
      },
      rehydrateData: assign({
        interventionsData: SessionStorage.getItem('interventionsData') ?? {
          type: 'FeatureCollection',
          features: [],
        },
      }),
      clearData: assign({
        interventionsData: {
          type: 'FeatureCollection',
          features: [],
        },
      }),
    },
    guards: {
      isResultValid: (ctx, evt) => evt.result !== undefined,
    },
  },
)
