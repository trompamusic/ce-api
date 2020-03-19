import * as jwt from 'jsonwebtoken'
import { AuthorizationError } from 'graphql-auth-directives/dist/errors'
import * as micromatch from 'micromatch'

const JWT_ISSUER = process.env.JWT_ISSUER || 'https://trompamusic.eu'
const JWT_SECRET = process.env.JWT_SECRET
const JWT_AUTH_KEYS = process.env.JWT_AUTH_KEYS ? JSON.parse(process.env.JWT_AUTH_KEYS) : []
const JWT_EXPIRES = process.env.JWT_EXPIRES || '1d'

/**
 * Verify if the request is authenticated and is authorized to access the given scope.
 * @param context
 * @param scope
 * @returns {Object}
 */
export const verifyRequest = (context, scope) => {
  const req = context.req || context.request
  const token = req && (req.headers.authorization || req.headers.Authorization)

  if (!token) {
    throw new AuthorizationError({ message: 'No authorization token.' })
  }

  const id = token.replace('Bearer ', '')
  let payload = null

  try {
    payload = jwt.verify(id, JWT_SECRET)
  } catch (error) {
    throw new AuthorizationError({
      message: error.name === 'TokenExpiredError' ? 'Your token is expired' : 'You are not authorized for this resource'
    })
  }

  if (!payload || !micromatch.isMatch(scope, payload.scopes)) {
    throw new AuthorizationError({
      message: 'You are not authorized for this resource'
    })
  }

  return payload
}

export const generateToken = (id, apiKey, scopes) => {
  // check if key is valid
  const keyPair = JWT_AUTH_KEYS.find(item => item.apiKey === apiKey && item.id === id)

  if (!keyPair) {
    throw new Error('The apiKey and id combination is not correct')
  }

  // verify if the requested scopes are allowed
  for (let index = 0; index < scopes.length; index++) {
    if (!micromatch.isMatch(scopes[index], keyPair.scopes)) {
      throw new Error(`You don't have access to the requested '${scopes[index]}' scope`)
    }
  }

  // generate token
  return jwt.sign({ id, scopes }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES,
    issuer: JWT_ISSUER
  })
}
