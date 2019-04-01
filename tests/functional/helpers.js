import { execute as exec, makePromise } from 'apollo-link'
import { HttpLink } from 'apollo-link-http'
import fetch from 'node-fetch'

const link = new HttpLink({ uri: 'http://localhost:4000/graphql', fetch })

export const execute = (query, variables) => {
  return makePromise(exec(link, { query, variables }))
}

expect.extend({
  toContainData (received, key) {
    if (received && received.errors) {
      const message = received.errors.map(error => error.message).join('\n')

      return { message: () => `expected response to not contain errors: \n\n${message}`, pass: false }
    }

    if (received && received.data && received.data[key] !== null) {
      return { pass: true }
    }

    return { message: () => `expected response to contain the data ${key}`, pass: false }
  }
})
