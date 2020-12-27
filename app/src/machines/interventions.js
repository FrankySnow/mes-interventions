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
  },
  on: {
    'NEWINTERVENTION.CHANGE': {
      actions: [
        assign({
          newIntervention: (ctx, evt) => evt.newIntervention,
        }),
      ],
    },
    'NEWINTERVENTION.COMMIT': {
      actions: [
        assign({
          newIntervention: {},
          allInterventions: (ctx, evt) => ctx.allInterventions.concat(evt.newIntervention),
        }),
        'persist',
      ],
    },
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
