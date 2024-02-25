import type { InjectionKey } from 'vue'
import { Actor } from 'xstate'
import { authMachine } from 'src/actors/authMachine'

export const authKey = Symbol('auth') as InjectionKey<Actor<typeof authMachine>>
