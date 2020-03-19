import { neo4jgraphql } from 'neo4j-graphql-js'
import { pubsub } from '../resolvers'

export default class QueryAndPublishResolver {
  static createResolver (type, customTriggerName) {
    return (object, params, ctx, resolveInfo) => {
      const selections = resolveInfo.fieldNodes[0] && resolveInfo.fieldNodes[0].selectionSet.selections
      const hasIdentifier = selections && selections.find(({ name }) => name.value === 'identifier')

      // add identifier to selections
      if (!hasIdentifier) {
        resolveInfo.fieldNodes[0].selectionSet.selections.push({
          kind: 'Field',
          name: {
            kind: 'Name',
            value: 'identifier'
          },
          arguments: [],
          directives: []
        })
      }

      return neo4jgraphql(object, params, ctx, resolveInfo).then(response => {
        // remove the identifier so it doesn't end up in the response if the original request does not include it in
        // its response
        if (!hasIdentifier) {
          const idx = selections.findIndex(({ name }) => name.value === 'identifier')

          selections.splice(idx, 1)
        }

        // publish for subscriptions
        if (response.identifier) {
          // always trigger a ThingCreateMutation
          pubsub.publish('ThingCreateMutation', { type, identifier: response.identifier })

          if (customTriggerName) {
            pubsub.publish(customTriggerName, { type, identifier: response.identifier, params })
          }
        }

        return response
      })
    }
  }
}
