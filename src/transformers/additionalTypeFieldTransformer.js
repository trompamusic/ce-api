import { TransformRootFields } from 'graphql-tools'
import { UserInputError } from 'apollo-server'
import isURL from 'validator/lib/isURL'
import { parseFieldName } from '../utils/schema'

/**
 * Test the given additionalType values for valid URLs
 * @param {null|[string]} values
 * @return {boolean}
 */
export const additionalTypeIsValid = (values) => {
  if (!Array.isArray(values)) {
    return true
  }

  return !values.some(additionalType => !isURL(additionalType, {
    require_protocol: true,
    require_valid_protocol: true,
    protocols: ['http', 'https']
  }))
}

export const additionalTypeFieldTransformer = new TransformRootFields((operation, fieldName, field) => {
  // Only needed for mutations
  if (operation !== 'Mutation') {
    return undefined
  }

  const { action } = parseFieldName(fieldName)

  if (action !== 'Create' && action !== 'Update' && action !== 'Merge') {
    return undefined
  }

  const next = field.resolve

  field.resolve = (object, params, context, info) => {
    if (!additionalTypeIsValid(params.additionalType)) {
      throw new UserInputError('additionalType list can only contain valid URLs with protocol')
    }

    return next(object, params, context, info)
  }
})
