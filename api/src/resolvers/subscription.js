import { pubsub } from '../resolvers'
import { withFilter } from 'graphql-subscriptions'
import { debug } from '../index'

export const subscriptionResolvers = {
  Subscription: {
    ControlActionRequest: {
      subscribe: withFilter(
        () => pubsub.asyncIterator('ControlActionRequest'),
        (payload, variables) => {
          debug('ControlActionRequest payload:')
          debug(payload)
          debug('ControlActionRequest variables')
          debug(variables)
          debug(payload.entryPointIdentifier === variables.entryPointIdentifier ? 'true' : 'false')
          return payload.entryPointIdentifier === variables.entryPointIdentifier
        }
      )
    },
    ControlActionMutation: {
      subscribe: withFilter(
        () => pubsub.asyncIterator('ControlActionMutation'),
        (payload, variables) => {
          debug('ControlActionMutation payload:')
          debug(payload)
          debug('ControlActionMutation variables')
          debug(variables)
          return payload.identifier === variables.identifier
        }
      )
    }
  }
}
