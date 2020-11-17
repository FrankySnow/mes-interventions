// import something here

import { inspect } from '@xstate/inspect'
import { boot } from 'quasar/wrappers'

export default boot(() => {
  inspect({
    iframe: false,
  })
})
