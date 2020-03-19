/**
 * Generate a scope from the given mutation and fieldName
 * @param {string} mutation
 * @param {string} fieldName
 * @returns {string}
 */
export const generateScope = (mutation, fieldName) => {
  const [, action, type] = fieldName.match(/^([A-Z][a-z]+)([A-Z]\w+)/)

  return `${mutation}:${type}:${action}`
}
