import { queryResolvers } from './resolvers/query'
import { mutationResolvers } from './resolvers/mutation'
import { subscriptionResolvers } from './resolvers/subscription'
import { PubSub } from 'graphql-subscriptions'

export const pubsub = new PubSub()

/*
 * Concatenate resolvers
 */
let aggregatedResolvers = queryResolvers

for (let key in mutationResolvers) {
  if (mutationResolvers.hasOwnProperty(key)) aggregatedResolvers[key] = mutationResolvers[key]
}

for (let key in subscriptionResolvers) {
  if (subscriptionResolvers.hasOwnProperty(key)) aggregatedResolvers[key] = subscriptionResolvers[key]
}

export const resolvers = aggregatedResolvers

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

// hydrate node data with searchScore
export function hydrateNodeSearchScore (nodeData, weight) {
  if (weight !== undefined) {
    nodeData._searchScore = weight
  }
  return nodeData
}
