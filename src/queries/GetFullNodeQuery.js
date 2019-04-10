const defaultDepth = 3

class GetFullNodeQuery {
  /**
   * @param type
   * @param identifier
   * @param depth
   */
  constructor (type, identifier, depth = defaultDepth) {
    this.type = type
    this.identifier = identifier
    this.depth = depth
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
      `MATCH (\`n\`:\`${this.type}\`)`,
      `WHERE \`n\`.\`identifier\` = "${this.identifier}"`,
      `RETURN \`n\` {\`_schemaType\`:HEAD(labels(\`n\`)), \`identifier\`:\`n\`.\`identifier\`} AS \`_payload\``
    ].join(' ')
  }
}

export default GetFullNodeQuery
