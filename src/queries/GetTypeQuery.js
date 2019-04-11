class GetTypeQuery {
  /**
   * @param identifier
   */
  constructor (identifier) {
    this.identifier = identifier
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
      `MATCH (\`n\`)`,
      `WHERE \`n\`.\`identifier\` = "${this.identifier}"`,
      `RETURN \`n\` {\`_schemaType\`:HEAD(labels(\`n\`))} AS \`_payload\``
    ].join(' ')
  }
}

export default GetTypeQuery
