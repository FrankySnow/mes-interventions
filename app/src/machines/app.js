import { Machine, assign } from 'xstate'

export default Machine(
  {
    strict: true,
    id: 'appMachine',
    initial: 'loading',
    context: {
      searchResult: {},
    },
    states: {
      loading: {
        always: 'initialized',
      },
      initialized: {
        on: {
          SEARCH: 'searching',
        },
      },
      searching: {
        on: {
          'RESULT.SELECT': {
            actions: 'assignSearchResult',
            target: 'displaying.result',
          },
        },
      },
      displaying: {
        states: {
          result: {
            on: {
              'RESULT.COMMIT': 'intervention',
            },
          },
          intervention: {
            on: {
              CANCEL: '#appMachine.initialized',
            },
          },
        },
      },
    },
  },
  {
    actions: {
      assignSearchResult: assign({
        searchResult: (ctx, ev) => ev.result,
      }),
    },
  },
)
