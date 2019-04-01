import snakeCase from 'lodash/snakeCase'

class AddQuery {
  /**
   * @param params
   */
  constructor (params) {
    this.params = params
  }

  /**
   * @returns {string}
   */
  get query () {
    return [
      `MATCH (\`node_from\`:\`${this.params.from.type}\` {identifier: "${this.params.from.identifier}"})`,
      `MATCH (\`node_to\`: \`${this.params.to.type}\` {identifier: "${this.params.to.identifier}"})`,
      `CREATE (\`node_from\`)-[\`relation\`:\`${snakeCase(this.params.field).toUpperCase()}\`]->(\`node_to\`)`,
      `RETURN { from: \`node_from\` ,to: \`node_to\` } AS \`_payload\`;`
    ].join(' ')
  }
}

export default AddQuery
