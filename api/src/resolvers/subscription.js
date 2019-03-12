import { pubsub } from '../resolvers'
import { withFilter } from 'graphql-subscriptions'

export const subscriptionResolvers = {
  Subscription: {
    nodeMutation: {
      subscribe: withFilter(
        () => pubsub.asyncIterator('nodeMutation'),
        (payload, variables) => {
          return payload.identifier === variables.identifier
        }
      )
    }
  }
}
