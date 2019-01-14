import { queryResolvers } from "./resolvers/query";
import { interfaceResolvers } from "./resolvers/interface";
import { unionResolvers } from "./resolvers/union";

/*
 * Concatenate resolvers
 */
export const resolvers = [queryResolvers, interfaceResolvers, unionResolvers];
