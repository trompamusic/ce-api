import validator from 'validator'
import { Router } from 'express'
import { getDocument, isValidLanguage } from './helpers/document'
import { transformJsonLD } from './helpers/transformers'
import { info } from '../utils/logger'
import { generateToken } from '../auth/auth'
import cors from 'cors'

const router = new Router()

/**
 * This middleware function validates the request method and sets the Allow and CORS headers based on the given
 * allowedMethods. When the request uses a method that is not in the list, it will respond with an 405 response.
 * @param allowedMethods
 * @return {function(Request, Response, NextFunction): *}
 */
const allowedMethods = (allowedMethods) => (req, res, next) => {
  res.setHeader('Allow', allowedMethods.join(', '))

  if (!allowedMethods.includes(req.method)) {
    return res.status(405).send()
  }

  cors({ methods: allowedMethods })(req, res, next)
}

router.all('/', allowedMethods(['OPTIONS', 'POST', 'GET']))

/**
 * Health check endpoint
 */
router.all('/health', allowedMethods(['OPTIONS', 'GET']))
router.get('/health', (req, res) => {
  res.status(200).send({ message: 'OK' })
})

router.all('/jwt', allowedMethods(['OPTIONS', 'POST']))
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

/**
 * Get document by identifier
 */
router.all('/:identifier', allowedMethods(['OPTIONS', 'GET']))
router.get('/:identifier', (req, res) => {
  const { identifier } = req.params
  const accept = req.headers.accept || 'application/json'
  const acceptLang = req.headers['accept-language']

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

export default router
