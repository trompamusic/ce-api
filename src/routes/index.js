import validator from 'validator'
import { Router } from 'express'
import { getDocument, isValidLanguage } from './helpers/document'
import { transformJsonLD } from './helpers/transformers'
import { info } from '../utils/logger'
import { generateToken } from '../auth/auth'

const router = new Router()

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
  const accept = req.headers.accept || 'application/json'
  const acceptLang = req.headers["accept-language"]

  // Validate the identifier
  if (!validator.isUUID(identifier)) {
    return res.status(400).send({ error: { message: 'Identifier should be UUID' } })
  }

  const baseURL = `${req.protocol}://${req.get('host')}`

  getDocument(identifier, baseURL)
    .then(({ data, type }) => {
      // Transform document to JSON-LD
      if (accept === 'application/ld+json') {
        if (!isValidLanguage(data, acceptLang)) {
          return res.status(406).send()
        }
        return res.status(200).send(transformJsonLD(type, data, baseURL))
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

  try {
    const jwt = generateToken(id, apiKey, scopes)

    res.send({ success: true, jwt })
  } catch (error) {
    return res.status(403).send({ success: false, message: error.message })
  }
})

export default router
