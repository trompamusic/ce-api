import { TransformRootFields } from 'graphql-tools'
import { UserInputError } from 'apollo-server'
import isURL from 'validator/lib/isURL'
import { parseFieldName } from '../utils/schema'

/**
 * Test the given field values for valid URLs
 * @param {null|[string]} values
 * @return {boolean}
 */
export const fieldIsValid = (values) => {
  if (!Array.isArray(values)) {
    return true
  }

  return !values.some(value => !isURL(value, {
    require_protocol: true,
    require_valid_protocol: true,
    protocols: ['http', 'https']
  }))
}

const validationFields = ['additionalType', 'mediumOfPerformance']

export const validUrlFieldTransformer = new TransformRootFields((operation, fieldName, field) => {
  // Only needed for mutations
  if (operation !== 'Mutation') {
    return undefined
  }

  const { action, type } = parseFieldName(fieldName)

  if (action !== 'Create' && action !== 'Update' && action !== 'Merge') {
    return undefined
  }

  const next = field.resolve

  field.resolve = (object, params, context, info) => {
    validationFields.forEach(field => {
      if (!fieldIsValid(params[field])) {
        throw new UserInputError(`${field} list can only contain valid URLs with protocol`)
      }
    })
    return next(object, params, context, info)
  }
})
