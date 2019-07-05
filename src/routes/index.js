import validator from 'validator'
import { Router } from 'express'
import { getDocument } from './helpers/document'
import { transformJsonLD } from './helpers/transformers'
import { info } from '../utils/logger'

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
  const accept = req.headers['accept'] || 'application/json'

  // Validate the identifier
  if (!validator.isUUID(identifier)) {
    return res.status(400).send({ error: { message: 'Identifier should be UUID' } })
  }

  const baseURL = `${req.protocol}://${req.get('host')}`

  getDocument(identifier, baseURL)
    .then(({ data, type }) => {
      // Transform document to JSON-LD
      if (accept === 'application/json-ld') {
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

export default router
