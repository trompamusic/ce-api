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
    ThingCreateMutation: {
      subscribe: withFilter(
        () => pubsub.asyncIterator('ThingCreateMutation'),
        (payload, variables) => {
          return !variables.onTypes || variables.onTypes.includes(payload.type)
        }
      ),
      resolve: payload => payload
    },
    MediaObjectCreateMutation: {
      subscribe: withFilter(
        () => pubsub.asyncIterator('MediaObjectCreateMutation'),
        (payload, variables) => {
          console.log(variables, payload)
          return !variables.encodingFormat || variables.encodingFormat === payload.params.encodingFormat
        }
      ),
      resolve: payload => ({ type: payload.type, identifier: payload.identifier })
    },
    AudioObjectCreateMutation: {
      subscribe: withFilter(
        () => pubsub.asyncIterator('AudioObjectCreateMutation'),
        (payload, variables) => {
          return !variables.encodingFormat || variables.encodingFormat === payload.params.encodingFormat
        }
      ),
      resolve: payload => ({ type: payload.type, identifier: payload.identifier })
    },
    VideoObjectCreateMutation: {
      subscribe: withFilter(
        () => pubsub.asyncIterator('VideoObjectCreateMutation'),
        (payload, variables) => {
          return !variables.encodingFormat || variables.encodingFormat === payload.params.encodingFormat
        }
      ),
      resolve: payload => ({ type: payload.type, identifier: payload.identifier })
    }
  }
}
