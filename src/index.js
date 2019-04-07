import { driver } from './driver'
import { schema } from './schema'
import { ApolloServer } from 'apollo-server-express'
import express from 'express'
import bodyParser from 'body-parser'
import GetRequest from './REST/GetRequest'
import { debug as Debug } from 'debug'
import validator from "validator"
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

  // validate against UUID
  if (!validator.isUUID(identifier)) {
    res.status('404').send(`{"error":{"message":"Not found"}}`)
  }

  const getRequest = new GetRequest(identifier)
  let promise = getRequest.find
  promise
    .then(result => {
      info('result')
      info(result)
      res.status('200').send(result)
    }, reason => {
      info('restRequest rejected')
      throw reason
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
