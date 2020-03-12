import validator from 'validator'
import { Router } from 'express'
import { sign } from 'jsonwebtoken'
import * as micromatch from 'micromatch'
import { getDocument } from './helpers/document'
import { transformJsonLD } from './helpers/transformers'
import { info } from '../utils/logger'

const router = new Router()

const JWT_ISSUER = process.env.JWT_ISSUER || 'https://trompamusic.eu'
const JWT_SECRET = process.env.JWT_SECRET
const JWT_AUTH_KEYS = process.env.JWT_AUTH_KEYS ? JSON.stringify(process.env.JWT_AUTH_KEYS) : []

/**
 * Health check endpoint
 */
router.get('/health', (req, res) => {
  res.status(200).send({ message: 'OK' })
})

/**
 * Get document by identifier
 */
router.get('/:identifier', (req, res) => {
  const { identifier } = req.params
  const accept = req.headers['accept'] || 'application/json'

  // Validate the identifier
  if (!validator.isUUID(identifier)) {
    return res.status(400).send({ error: { message: 'Identifier should be UUID' } })
  }

  const baseURL = `${req.protocol}://${req.get('host')}`

  getDocument(identifier, baseURL)
    .then(({ data, type }) => {
      // Transform document to JSON-LD
      if (accept === 'application/ld+json') {
        return res.status(200).send(transformJsonLD(type, data))
      }

      res.status(200).send(data)
    }, reason => {
      info('restRequest rejected')
      throw reason
    })
    .catch(function (error) {
      let statusCode = 400
      const errorString = error.toString()

      if (errorString.toLowerCase().includes('not implemented')) {
        statusCode = 406
      }

      if (errorString.toLowerCase().includes('not found')) {
        statusCode = 404
      }

      res.status(statusCode).send(errorString)
    })
})

router.post('/jwt', async (req, res) => {
  const { id, apiKey, scopes } = req.body

  if (!id || !apiKey) {
    return res.status(401).send({
      success: false,
      message: 'The `apiKey` or `id` property is missing in the request body'
    })
  }

  if (!scopes || !Array.isArray(scopes) || !scopes.length) {
    return res.status(401).send({
      success: false,
      message: 'The `scopes` property is missing or not an Array with at least one scope'
    })
  }

  // check if key is valid
  const keyPair = JWT_AUTH_KEYS.find(item => item.apiKey === apiKey && item.id === id)

  if (!keyPair) {
    return res.status(403).send({ success: false, message: 'Forbidden' })
  }

  // verify if the requested scopes are allowed
  for (let index = 0; index < scopes.length; index++) {
    if (!micromatch.isMatch(scopes[index], keyPair.scopes)) {
      return res.status(403).send({
        success: false,
        message: `You don't have access to the requested '${scopes[index]}' scope`
      })
    }
  }

  // generate token
  const token = sign({ id, scopes }, JWT_SECRET, {
    expiresIn: '1d',
    issuer: JWT_ISSUER
  })

  return res.send({ success: true, jwt: token })
})

export default router
