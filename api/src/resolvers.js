import { queryResolvers } from './resolvers/query'
import { interfaceResolvers } from './resolvers/interface'
import { unionResolvers } from './resolvers/union'
import { mutationResolvers } from './resolvers/mutation'
import { subscriptionResolvers } from './resolvers/subscription'
import { PubSub } from 'graphql-subscriptions'

export const channels = [
  { id: '1', name: 'baseball', messages: [{ id: '2', text: 'baseball is life' }] },
  { id: 'essentia_1234', name: 'Essentia process', messages: [] }
]

// export const asyncProcesses = [
//   { actionIdentifier: '1', ControlActionType: 'essentia', status: 'error', result: null, error: 'nope, did not go well' },
//   { actionIdentifier: '2', ControlActionType: 'essentia', status: 'complete', result: 'https://s3.path.to/result', error: null },
//   { actionIdentifier: '3', ControlActionType: 'essentia', status: 'running', result: null, error: null },
//   { actionIdentifier: '4', ControlActionType: 'essentia', status: 'accepted', result: null, error: null }
// ]

export const pubsub = new PubSub()

/*
 * Concatenate resolvers
 */
let aggregatedResolvers = queryResolvers

for (let key in interfaceResolvers) {
  if (interfaceResolvers.hasOwnProperty(key)) aggregatedResolvers[key] = interfaceResolvers[key]
}

for (let key in unionResolvers) {
  if (unionResolvers.hasOwnProperty(key)) aggregatedResolvers[key] = unionResolvers[key]
}

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

// extract _schemaType from resolve object
export function retrieveSchemaType (obj) {
  if (obj.hasOwnProperty('_schemaType') && obj._schemaType !== undefined) {
    return obj._schemaType
  }
  throw Error('_schemaType could not be retrieved')
}
