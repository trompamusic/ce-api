import { driver } from './driver'
import { schema } from './schema'
// import { ApolloServer } from 'apollo-server'
import { ApolloServer } from 'apollo-server-express'
import express from 'express'
import bodyParser from 'body-parser'
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
  context: ({ req }) => {
    return { driver, req }
  }
})

const app = express()
app.use(bodyParser.json())

// const checkErrorHeaderMiddleware = async (req, res, next) => {
//   req.error = req.headers['x-error']
//   next()
// }
const checkGraphQLRequestMiddleware = function (req, res, next) {
  // a POST request with none or 'graphql' segment is handled as GraphQL
  if (['', '/', 'graphql'].indexOf(req.url.toLowerCase()) >= 0 && req.method === 'POST') {
    next()
  }
}
app.use('*', checkGraphQLRequestMiddleware)

server.applyMiddleware({ app, path: '/' })

/*
 * Start Apollo server
 */
app.listen(process.env.GRAPHQL_LISTEN_PORT, '0.0.0.0')
