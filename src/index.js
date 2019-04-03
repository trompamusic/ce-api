import { driver } from './driver'
import { schema } from './schema'
import { ApolloServer } from 'apollo-server-express'
import express from 'express'
import validator from 'validator'
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

const restRequest = function (req, res, next) {
  const identifier = req.params.identifier
  if (validator.isUUID(identifier) && req.method.toUpperCase() === 'GET') {
    res.status('200').send(`{"data":{"identifier":"${identifier}"}}}`)
  }
  res.status('404').send()
}

app.use('/:identifier', restRequest)
server.applyMiddleware({ app, path: '/' })

/*
 * Start Apollo server
 */
app.listen(process.env.GRAPHQL_LISTEN_PORT, '0.0.0.0')
