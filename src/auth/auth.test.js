import * as jwt from 'jsonwebtoken'
import { verifyRequest, generateToken } from './auth'
import { AuthorizationError } from 'graphql-auth-directives'

describe('verifyRequest', function () {
  const makeContext = (jwt) => ({
    req: {
      headers: jwt ? ({
        Authorization: `Bearer ${jwt}`
      }) : {}
    }
  })

  const signToken = (id, scopes, expiresIn) => jwt.sign({ id, scopes }, process.env.JWT_SECRET, { expiresIn })

  const adminToken = signToken('admin', ['*'], '1d')
  const adminTokenExpired = signToken('admin', ['*'], '-1d')
  const adminTokenLimited = signToken('admin', ['Mutation:DigitalDocument:*'], '1d')
  const onlyPersonsToken = signToken('only-persons', ['Mutation:Person:*'], '1d')

  it('should return the token payload if the token is valid', () => {
    expect(verifyRequest(makeContext(adminToken), 'Mutation:ControlAction:Create')).toMatchObject({ id: 'admin' })
    expect(verifyRequest(makeContext(adminToken), 'Mutation:DigitalDocument:Create')).toMatchObject({ id: 'admin' })
    expect(verifyRequest(makeContext(adminTokenLimited), 'Mutation:DigitalDocument:Create')).toMatchObject({ id: 'admin' })
  })

  it('should throw if the token is not given', () => {
    expect(() => verifyRequest(makeContext(''), 'Mutation:ControlAction:Create')).toThrowError(AuthorizationError)
    expect(() => verifyRequest(makeContext(''), 'Mutation:ControlAction:Create')).toThrowError('No authorization token.')
  })

  it('should throw an error if the token has not got the permissions', () => {
    expect(() => verifyRequest(makeContext(adminTokenLimited), 'Mutation:ControlAction:Create')).toThrowError(AuthorizationError)
    expect(() => verifyRequest(makeContext(adminTokenLimited), 'Mutation:ControlAction:Create')).toThrowError('You are not authorized for this resource')
    expect(() => verifyRequest(makeContext(onlyPersonsToken), 'Mutation:ControlAction:Create')).toThrowError(AuthorizationError)
    expect(() => verifyRequest(makeContext(onlyPersonsToken), 'Mutation:ControlAction:Create')).toThrowError('You are not authorized for this resource')
  })

  it('should throw an error if the token has expired', () => {
    expect(() => verifyRequest(makeContext(adminTokenExpired), 'Mutation:ControlAction:Create')).toThrowError(AuthorizationError)
    expect(() => verifyRequest(makeContext(adminTokenExpired), 'Mutation:ControlAction:Create')).toThrowError('Your token is expired')
  })
})

describe('generateToken', function () {
  it('should generate a token for valid credentials', () => {
    expect(() => generateToken('admin', 'api-key-for-admin', ['*'])).not.toThrow()
    expect(() => generateToken('only-persons', 'api-key-for-only-persons', ['Mutation:Person:*'])).not.toThrow()
  })

  it('should throw an error when the api key is wrong', () => {
    expect(() => generateToken('admin', 'wrong-api-key-for-admin', ['*'])).toThrow('The apiKey and id combination is not correct')
  })

  it('should throw an error when the id is wrong', () => {
    expect(() => generateToken('johndoe', 'api-key-for-admin', ['*'])).toThrow('The apiKey and id combination is not correct')
  })

  it('should throw an error when a scope isn\'t allowed', () => {
    expect(() => generateToken('only-persons', 'api-key-for-only-persons', ['Mutation:*'])).toThrow('You don\'t have access to the requested \'Mutation:*\' scope')
    expect(() => generateToken('only-persons', 'api-key-for-only-persons', ['Mutation:Person:Create', 'Mutation:DigitalDocument:Create'])).toThrow('You don\'t have access to the requested \'Mutation:DigitalDocument:Create\' scope')
  })
})
