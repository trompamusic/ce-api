import { TransformRootFields } from 'graphql-tools'
import { generateScope } from '../utils/schema'
import { verifyRequest } from '../auth/auth'

export const authenticationFieldTransformer = new TransformRootFields((operation, fieldName, field) => {
  // authentication is only needed for Mutations
  if (operation !== 'Mutation') {
    return undefined
  }

  const next = field.resolve

  field.resolve = (object, params, context, info) => {
    // Verify request with a generated scope, for the following query:
    //
    // ```graphql
    // mutation {
    //   CreatePerson(...) {
    //     identifier
    //   }
    // }
    // ```
    //
    // The scope will be: `Mutation:Person:Create`.
    verifyRequest(context, generateScope(operation, fieldName))

    return next(object, params, context, info)
  }
})
