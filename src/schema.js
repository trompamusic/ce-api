import { makeAugmentedSchema } from 'neo4j-graphql-js'
import { resolvers } from './resolvers'
import concatenate from 'concatenate'
import walkSync from 'walk-sync'

/*
 * Determine type definitions from which to auto generate queries and mutations
 */
const graphQlFiles = walkSync(`${__dirname}/schema`, { directories: false, includeBasePath: true, globs: ['**/**/*.graphql'] })
const typeDefs = concatenate.sync(graphQlFiles)

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
    query: {
      exclude: [
        'ActionInterface',
        'CreativeWorkInterface',
        'LegalPersonInterface',
        'MediaObjectInterface',
        'MetadataInterface',
        'OrganizationInterface',
        'PerformerInterface',
        'ProvenanceActivityInterface',
        'ProvenanceAgentInterface',
        'ProvenanceEntityInterface',
        'SearchableInterface',
        'ThingInterface',
        '_ThingCreateMutationPayload'
      ]
    },
    mutation: {
      exclude: [
        'Subscription',
        '_ThingCreateMutationPayload'
      ]
    }
  }
})
