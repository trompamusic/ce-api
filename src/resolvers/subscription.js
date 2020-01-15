import { pubsub } from '../resolvers'
import { withFilter } from 'graphql-subscriptions'

export const subscriptionResolvers = {
  Subscription: {
    ControlActionRequest: {
      subscribe: withFilter(
        () => pubsub.asyncIterator('ControlActionRequest'),
        (payload, variables) => {
          return payload.entryPointIdentifier === variables.entryPointIdentifier
        }
      )
    },
    ControlActionMutation: {
      subscribe: withFilter(
        () => pubsub.asyncIterator('ControlActionMutation'),
        (payload, variables) => {
          return payload.identifier === variables.identifier
        }
      )
    },
    CreateNodeMutation: {
      subscribe: withFilter(
        () => pubsub.asyncIterator('CreateNodeMutation'),
        (payload, variables) => {
          return !variables.onTypes || variables.onTypes.includes(payload.type)
        }
      ),
      resolve: payload => payload
    }
  }
}
