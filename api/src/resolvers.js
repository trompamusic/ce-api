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
