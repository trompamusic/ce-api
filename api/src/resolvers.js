import { queryResolvers } from "./resolvers/query";
import { interfaceResolvers } from "./resolvers/interface";
import { unionResolvers } from "./resolvers/union";

/*
 * Concatenate resolvers
 */
let aggregatedResolvers = queryResolvers;

for (var key in interfaceResolvers) {
  if (interfaceResolvers.hasOwnProperty(key)) aggregatedResolvers[key] = interfaceResolvers[key];
}

for (var key in unionResolvers) {
  if (unionResolvers.hasOwnProperty(key)) aggregatedResolvers[key] = unionResolvers[key];
}

export const resolvers = aggregatedResolvers;
