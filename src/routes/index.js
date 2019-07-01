import validator from 'validator'
import { Router } from 'express'
import GetRequest from '../REST/GetRequest'
import { info } from '../utils/logger'

const router = new Router()

router.get('/health', (req, res) => {
  res.status(200).send({ message: 'OK' })
})

router.get('/:identifier', (req, res) => {
  const { identifier } = req.params

  if (!validator.isUUID(identifier)) {
    return res.status(400).send({ error: { message: 'Identifier should be UUID' } })
  }

  const baseURL = `${req.protocol}://${req.get('host')}`
  const getRequest = new GetRequest(identifier, baseURL)

  getRequest.find(req, res)
    .then(result => {
      res.status(200).send(result)
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
