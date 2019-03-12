import { debug, warning } from '../index'
import { pubsub } from '../resolvers'
import { withFilter } from 'graphql-subscriptions'

export const subscriptionResolvers = {
  Subscription: {
    messageAdded: {
      subscribe: withFilter(
        () => pubsub.asyncIterator('messageAdded'),
        (payload, variables) => {
          return payload.channelId === variables.channelId
        }
      )
    },
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
