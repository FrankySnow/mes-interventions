import { SessionStorage } from 'quasar'
import { assign, Machine } from 'xstate'

const interventionsMachine = Machine({
  id: 'interventions',
  strict: true,
  initial: 'loading',
  context: {
    allInterventions: [],
    newIntervention: {},
  },
  states: {
    loading: {
      always: 'ready',
    },
    ready: {},
    saving: {
      after: {
        1000: {
          actions: [
            assign({
              newIntervention: {},
              allInterventions: (ctx) => ctx.allInterventions.concat(ctx.newIntervention),
            }),
            'persist',
          ],
          target: 'ready',
        },
      },
    },
  },
  on: {
    'NEWINTERVENTION.CHANGE': {
      actions: [
        assign({
          newIntervention: (_ctx, evt) => evt.newIntervention,
        }),
      ],
    },
    'NEWINTERVENTION.COMMIT': 'saving',
  },
})

// "Persisted machine"
export default interventionsMachine.withConfig({
  actions: {
    persist: (ctx) => SessionStorage.set('interventions', ctx.allInterventions),
  },
}, {
  newIntervention: {},
  allInterventions: SessionStorage.getItem('interventions') ?? [],
})
