import http from 'http'
import { ApolloServer } from 'apollo-server-express'
import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import { debug } from './utils/logger'
import router from './routes/index'
import { driver } from './driver'
import { schema } from './schema'

const SERVER_HOST = process.env.HOST || '0.0.0.0'
const SERVER_PORT = process.env.PORT || 4000

// Initialize express
const app = express()

// Configure middlewares
app.use(bodyParser.json())
app.use(cors({ methods: ['GET', 'OPTIONS', 'POST'], allowedHeaders: ['Authorization'] }))

// Configure routes
app.use('/', router)

// Create a new ApolloServer instance, serving the GraphQL schema
// created using makeAugmentedSchema above and injecting the Neo4j driver
// instance into the context object so it is available in the
// generated resolvers to connect to the database.
const server = new ApolloServer({
  schema: schema,
  context: ({ req }) => {
    // make sure the `cookies` property is set (graphql-auth-directive will error if the `cookies` property is undefined)
    req.cookies = req.cookies || {}

    return ({ driver, req })
  }
})

// Bind the Apollo server to the express server.
server.applyMiddleware({ app, path: '/' })

const httpServer = http.createServer(app)
server.installSubscriptionHandlers(httpServer)

// Listen for errors.
app.on('error', error => debug(error))

// Start the express and Apollo server
httpServer.listen(SERVER_PORT, SERVER_HOST, () => {
  // Log the server url.
  console.log(`started server on ${SERVER_HOST}:${SERVER_PORT}`)
})
