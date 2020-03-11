import * as jwt from 'jsonwebtoken'
import { AuthorizationError } from 'graphql-auth-directives/dist/errors'
import * as micromatch from 'micromatch'

const JWT_SECRET = process.env.JWT_SECRET

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
