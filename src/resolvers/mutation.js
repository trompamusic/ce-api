import { neo4jgraphql } from 'neo4j-graphql-js'
import { pubsub } from '../resolvers'
import RequestControlActionCommand from '../commands/RequestControlActionCommand'

export const mutationResolvers = {
  Mutation: {
    RequestControlAction (object, params, ctx, resolveInfo) {
      const command = new RequestControlActionCommand(params, resolveInfo)
      return command.create
    },
    UpdateControlAction (object, params, ctx, resolveInfo) {
      return neo4jgraphql(object, params, ctx, resolveInfo).then(response => {
        if (typeof response.identifier === 'string') {
          pubsub.publish('ControlActionMutation', { ControlActionMutation: response, identifier: response.identifier })
        }

        return response
      })
    }
  }
}
