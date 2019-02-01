import { queryResolvers } from "./resolvers/query";
import { interfaceResolvers } from "./resolvers/interface";
import { unionResolvers } from "./resolvers/union";
import { mutationResolvers } from "./resolvers/mutation";

/*
 * Concatenate resolvers
 */
let aggregatedResolvers = queryResolvers;

for (let key in interfaceResolvers) {
  if (interfaceResolvers.hasOwnProperty(key)) aggregatedResolvers[key] = interfaceResolvers[key];
}

for (let key in unionResolvers) {
  if (unionResolvers.hasOwnProperty(key)) aggregatedResolvers[key] = unionResolvers[key];
}

for (let key in mutationResolvers) {
  if (mutationResolvers.hasOwnProperty(key)) aggregatedResolvers[key] = mutationResolvers[key];
}

export const resolvers = aggregatedResolvers;

// retrieval function for node data, hydrated with private schemaType properties
export function retrieveNodeData (node) {
  let data = node.properties;
  const labels = node.labels;
  if (labels instanceof Array && labels.length > 0){
    data._schemaType = labels.shift();
    data._additionalSchemaType = labels;
  }
  return data;
}

// hydrate node data with searchScore
export function hydrateNodeSearchScore(nodeData, weight) {
  if(weight !== undefined){
    nodeData._searchScore = weight;
  }
  return nodeData;
}

// extract _schemaType from resolve object
export function retrieveSchemaType (obj) {
  console.log('retrieveSchemaType');
  if(obj.hasOwnProperty('_schemaType') && obj._schemaType !== undefined){
    return obj._schemaType;
  }
  throw Error('_schemaType could not be retrieved');
}
