import { driver } from './driver'
import { schema } from './schema'
import { ApolloServer } from 'apollo-server-express'
import express from 'express'
import bodyParser from 'body-parser'
import GetRequest from './REST/GetRequest'
import { debug as Debug } from 'debug'
import validator from 'validator'
export const debug = Debug('ce-api-debug')
export const info = Debug('ce-api-info')
export const warning = Debug('ce-api-warning')

const allowedRestMethods = ['GET', 'OPTIONS']
const app = express()
app.use(bodyParser.json())

const restRequest = function (req, res, next) {
  const identifier = req.params.identifier
  const method = req.method.toUpperCase()

  // allow /graphql path to be resolved for POST and GET requests
  if (identifier.toLowerCase() === 'graphql') {
    next()
    return
  }

  // intercept methods other than GET/OPTIONS and return METHOD NOT ALLOWED
  if (allowedRestMethods.indexOf(method) < 0) {
    res.status('405').send(`{"error":{"message":"Method not allowed"}}`)
    return
  }

  // intercept health call
  if (method === 'GET' && identifier === 'health') {
    res.status('200').send(`{"message":"OK"}`)
    return
  }

  // validate against UUID
  if (!validator.isUUID(identifier)) {
    res.status('400').send(`{"error":{"message":"Identifier should be UUID"}}`)
    return
  }

  // respond to OPTIONS call
  if (method === 'OPTIONS') {
    res.status('204').set('Allow', allowedRestMethods.join(', ')).send()
    return
  }

  const getRequest = new GetRequest(identifier)
  let promise = getRequest.find
  promise
    .then(result => {
      res.status('200').send(result.properties)
    })
    .catch(function (error) {
      throw Error(error.toString())
    })
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
