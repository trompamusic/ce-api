import { driver } from './driver'
import { schema } from './schema'
import { ApolloServer } from 'apollo-server-express'
import express from 'express'
import validator from 'validator'
import bodyParser from 'body-parser'
import GetRequest from './REST/GetRequest'
import { debug as Debug } from 'debug'
export const debug = Debug('ce-api-debug')
export const info = Debug('ce-api-info')
export const warning = Debug('ce-api-warning')

const app = express()
app.use(bodyParser.json());

const restRequest = function (req, res, next) {
  const identifier = req.params.identifier

  // allow /graphql path to be resolved for POST and GET requests
  if (identifier.toLowerCase() === 'graphql') {
    next()
    return
  }

  // intercept methods other than GET and return METHOD NOT ALLOWED
  if (req.method.toUpperCase() !== 'GET') {
    res.status('405').send(`{"error":{"message":"Method not allowed"}}`)
    return
  }

  // only allow a valid UUID to be resolved
  if (validator.isUUID(identifier)) {
    const getRequest = new GetRequest(identifier)
    const result = getRequest.find
    res.status(result.status).send(result.data)
    return
  }

  // return not found
  res.status('404').send(`{"error":{"message":"Not found"}}`)
}

app.use('/:identifier', restRequest)

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

server.applyMiddleware({ app, path: '/' })

/*
 * Start Apollo server
 */
app.listen(process.env.GRAPHQL_LISTEN_PORT, '0.0.0.0')
