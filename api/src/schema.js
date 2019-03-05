import { makeAugmentedSchema } from 'neo4j-graphql-js'
import { resolvers } from './resolvers'
import fs from 'fs'
import path from 'path'

/*
 * Determine type definitions from which to auto generate queries and mutations
 */
const typeDefs = fs
  .readFileSync(
    process.env.GRAPHQL_SCHEMA || path.join(__dirname, `schema.graphql`)
  )
  .toString('utf-8')

/*
 * Create an executable GraphQL schema object from GraphQL type definitions
 * including autogenerated queries and mutations.
 * Optionally a config object can be included to specify which types to include
 * in generated queries and/or mutations. Read more in the docs:
 * https://grandstack.io/docs/neo4j-graphql-js-api.html#makeaugmentedschemaoptions-graphqlschema
 */
export const schema = makeAugmentedSchema({
  typeDefs,
  resolvers,
  allowUndefinedInResolve: true,
  config: {
    query: false
  }
})
