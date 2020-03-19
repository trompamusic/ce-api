import { queryResolvers } from './resolvers/query'
import { mutationResolvers } from './resolvers/mutation'
import { subscriptionResolvers } from './resolvers/subscription'
import { PubSub } from 'graphql-subscriptions'

export const pubsub = new PubSub()

export const resolvers = {
  ...queryResolvers,
  ...mutationResolvers,
  ...subscriptionResolvers
}

// retrieval function for node data, hydrated with private schemaType properties
export function retrieveNodeData (node) {
  let data = node.properties
  const labels = node.labels
  if (labels instanceof Array && labels.length > 0) {
    data._schemaType = labels.shift()
    data._additionalSchemaType = labels
  }
  return data
}
