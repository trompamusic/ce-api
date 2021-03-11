import { TransformRootFields } from 'graphql-tools'
import { buildPropertyValue, parseFieldName } from '../utils/schema'
import { buildArgument, buildName } from 'neo4j-graphql-js/dist/augment/ast'
import { Kind } from 'graphql/language/kinds'

export const createdUpdatedFieldTransformer = new TransformRootFields((operation, fieldName, field) => {
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
    info.fieldNodes = info.fieldNodes.map(fieldNode => {
      const createdIndex = fieldNode.arguments.findIndex(argument => argument.name.value === 'created')
      const modifiedIndex = fieldNode.arguments.findIndex(argument => argument.name.value === 'modified')

      // remove given created and modified arguments
      if (createdIndex !== -1) {
        fieldNode.arguments.splice(createdIndex, 1)
      }

      if (modifiedIndex !== -1) {
        fieldNode.arguments.splice(modifiedIndex, 1)
      }

      const date = new Date()

      const value = {
        kind: Kind.OBJECT,
        fields: [
          buildPropertyValue('year', Kind.INT, date.getUTCFullYear()),
          buildPropertyValue('month', Kind.INT, date.getUTCMonth()),
          buildPropertyValue('day', Kind.INT, date.getUTCDate()),
          buildPropertyValue('hour', Kind.INT, date.getUTCHours()),
          buildPropertyValue('minute', Kind.INT, date.getUTCMinutes()),
          buildPropertyValue('second', Kind.INT, date.getUTCSeconds()),
          buildPropertyValue('millisecond', Kind.INT, date.getUTCMilliseconds()),
          buildPropertyValue('timezone', Kind.STRING, 'z')
        ]
      }

      if (action === 'Create') {
        fieldNode.arguments.push(buildArgument({ name: buildName({ name: 'created' }), value }))
      }

      if (action === 'Create' || action === 'Update' || action === 'Merge') {
        fieldNode.arguments.push(buildArgument({ name: buildName({ name: 'modified' }), value }))
      }

      return fieldNode
    })

    return next(object, params, context, info)
  }
})
