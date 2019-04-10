import QueryHelper from '../helpers/QueryHelper'

class AddQuery {
  /**
   * @param params
   */
  constructor (params) {
    this.params = params
    this.queryHelper = new QueryHelper()
  }

  /**
   * @returns {string}
   */
  get query () {
    return [
      `MATCH (\`node_from\`:\`${this.params.from.type}\` {identifier: "${this.params.from.identifier}"})`,
      `MATCH (\`node_to\`: \`${this.params.to.type}\` {identifier: "${this.params.to.identifier}"})`,
      `CREATE (\`node_from\`)${this.queryHelper.generateRelationClause(this.params.from.type, this.params.field, 'relation')}(\`node_to\`)`,
      `RETURN { from: \`node_from\` ,to: \`node_to\` } AS \`_payload\`;`
    ].join(' ')
  }
}

export default AddQuery
