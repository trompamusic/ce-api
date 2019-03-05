import { driver } from './driver'
import { schema } from './schema'
import { ApolloServer } from 'apollo-server'
import { debug as Debug } from 'debug'
export const debug = Debug('ce-api-debug')
export const info = Debug('ce-api-info')
export const warning = Debug('ce-api-warning')

/*
 * Create a new ApolloServer instance, serving the GraphQL schema
 * created using makeAugmentedSchema above and injecting the Neo4j driver
 * instance into the context object so it is available in the
 * generated resolvers to connect to the database.
 */
const server = new ApolloServer({
  schema: schema,
  context: { driver }
})

/*
 * Start Apollo server
 */
server.listen(process.env.GRAPHQL_LISTEN_PORT, '0.0.0.0').then(({ url }) => {
  debug(`GraphQL API ready at ${url}`)
})
