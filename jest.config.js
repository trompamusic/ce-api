process.env.JWT_SECRET = 'not-so-secret'
process.env.JWT_AUTH_KEYS = JSON.stringify([
  { id: 'admin', apiKey: 'api-key-for-admin', scopes: ['*'] },
  { id: 'only-persons', apiKey: 'api-key-for-only-persons', scopes: ['Mutation:Person:*'] }
])

module.exports = {}
