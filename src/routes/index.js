import validator from 'validator'
import { Router } from 'express'
import { getDocument } from './helpers/document'
import { transformJsonLD } from './helpers/transformers'
import { info } from '../utils/logger'
import { sign } from 'jsonwebtoken'

const router = new Router()
const authKeys = JSON.parse(process.env.JWT_AUTH_KEYS)

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

router.post('/token', async (req, res) => {
  const { id, key } = req.body

  // check if key is valid
  const authKey = authKeys.find(x => x.id === id)
  if (typeof authKey === 'undefined' || authKey.key !== key) {
    return res.status(401).send({ success: false, message: 'Invalid request' })
  }

  // generate token
  const token = sign({ id: authKey.id, expiresIn: ((60 * 60) * (24 * 1)) * 1000, scope: authKey.scope }, process.env.JWT_SECRET)
  return res.send({ success: true, token: token })
})

export default router
