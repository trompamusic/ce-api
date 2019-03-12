import { pubsub } from '../resolvers'
import { withFilter } from 'graphql-subscriptions'

export const subscriptionResolvers = {
  Subscription: {
    ControlActionMutation: {
      subscribe: withFilter(
        () => pubsub.asyncIterator('ControlActionMutation'),
        (payload, variables) => {
          return payload.identifier === variables.identifier
        }
      )
    }
  }
}
