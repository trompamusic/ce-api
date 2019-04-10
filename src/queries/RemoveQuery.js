import QueryHelper from '../helpers/QueryHelper'

class RemoveQuery {
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
      `MATCH (\`node_from\`:\`${this.params.from.type}\` {\`identifier\`: "${this.params.from.identifier}"})`,
      this.queryHelper.generateRelationClause(this.params.from.type, this.params.field, 'relation'),
      `(\`node_to\`: \`${this.params.to.type}\` {\`identifier\`: "${this.params.to.identifier}"})`,
      `DELETE \`relation\``,
      `RETURN { from: \`node_from\` ,to: \`node_to\` } AS \`_payload\`;`
    ].join(' ')
  }
}

export default RemoveQuery
