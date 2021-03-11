import { Kind } from 'graphql/language/kinds'
import { buildName } from 'neo4j-graphql-js/dist/augment/ast'

/**
 * Parse the given field name into an action and type
 * @param {string} fieldName
 * @returns {{ action: string, type: string }}
 */
export const parseFieldName = (fieldName) => {
  const [, action, type] = fieldName.match(/^([A-Z][a-z]+)([A-Z]\w+)/)

  return {
    action,
    type
  }
}

/**
 * Generate a scope from the given mutation and fieldName
 * @param {string} mutation
 * @param {string} fieldName
 * @returns {string}
 */
export const generateScope = (mutation, fieldName) => {
  const { action, type } = parseFieldName(fieldName)

  return `${mutation}:${type}:${action}`
}

/**
 * Build an ObjectField AST node
 * @param name
 * @param kind
 * @param value
 * @return {{kind: "ObjectField", name: *, value: {kind, block: boolean, value}}}
 */
export const buildPropertyValue = (name, kind, value) => ({
  kind: Kind.OBJECT_FIELD,
  name: buildName({ name: name }),
  value: {
    kind: kind,
    value: value,
    block: false
  }
})
