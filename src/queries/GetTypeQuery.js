import QueryHelper from '../helpers/QueryHelper'

class GetTypeQuery {
  /**
   * @param identifier
   * @param [typeNames]
   */
  constructor (identifier, typeNames) {
    this.identifier = identifier
    this.typeNames = typeNames
  }

  /**
   * @returns {*}
   */
  get query () {
    return this._generateQuery()
  }

  /**
   * @returns {string}
   * @private
   */
  _generateQuery () {
    return [
      'MATCH (`n`)',
      `WHERE \`n\`.\`identifier\` = "${this.identifier}"`,
      `RETURN \`n\` { ${QueryHelper.schemaTypeClause('n', this.typeNames)} } AS \`_payload\``
    ].join(' ')
  }
}

export default GetTypeQuery
