class SearchQuery {
  /**
   * @param params
   * @param resolveInfo
   */
  constructor (params, resolveInfo) {
    this.params = params
    this.resolveInfo = resolveInfo

    this.searchableInterfaceType = this.resolveInfo.schema.getType('SearchableInterfaceType')
    this.searchableMetadataFields = this.resolveInfo.schema.getType('SearchableMetadataFields')

    const { onTypes, onFields } = this.params

    this.doEvaluateTypeSubset = Array.isArray(onTypes) && onTypes.length && onTypes.length !== this.searchableInterfaceType.getValues().length
    this.doEvaluateFieldSubset = Array.isArray(onFields) && onFields.length && onFields.length !== this.searchableMetadataFields.getValues().length
  }

  /**
   * @returns {string}
   */
  get query () {
    return [
      `CALL db.index.fulltext.queryNodes('metadataSearchFields', '${this._generateQueryClause()}')`,
      'YIELD `node`, `score`',
      this._generateTypeClause(),
      'RETURN node { .*, FRAGMENT_TYPE: HEAD(labels(node)), _searchScore: `score` }',
      'ORDER BY `score` DESC',
      this.params.offset > 0 ? 'SKIP toInteger($offset)' : '',
      this.params.first > -1 ? 'LIMIT toInteger($first)' : ''
    ].join(' ')
  }

  /**
   * @param field
   * @returns {string}
   * @private
   */
  _generateFieldSubStringClause (field) {
    // empty substring
    if (!this.params.substring) {
      return `${field}:/.*/`
    }

    const subString = this.params.substring.replace(/[^A-Za-z0-9.\-\s]/g, '')

    // prepare search substring
    return `${field}:(\\\\"${subString}~\\\\" OR \\\\"${subString}*\\\\")`
  }

  /**
   * @returns {string}
   * @private
   */
  _generateSubStringClause () {
    // empty substring
    if (!this.params.substring) {
      return '/.*/'
    }

    const subString = this.params.substring.replace(/[^A-Za-z0-9.\-\s]/g, '')

    // prepare search substring
    return `\\\\"${subString}~\\\\" OR \\\\"${subString}*\\\\"`
  }

  /**
   * @returns {*|string}
   * @private
   */
  _generateQueryClause () {
    // if only a subset of fields need to be evaluated: build query clause for [substring]~ on all eligible fields
    if (this.doEvaluateFieldSubset) {
      const fieldNames = this.doEvaluateFieldSubset ? this.params.onFields : this.searchableMetadataFields.getValues().map(field => { return field.name })

      return fieldNames
        .map(field => this._generateFieldSubStringClause(field))
        .join(' OR ')
    }

    return this._generateSubStringClause()
  }

  /**
   * @returns {string}
   * @private
   */
  _generateTypeClause () {
    // if only a subset of types need to be evaluated: build type clause for [substring]~ on all eligible fields
    let typeClause = ''
    if (this.doEvaluateTypeSubset) {
      const typeNames = this.doEvaluateTypeSubset ? this.params.onTypes : this.searchableInterfaceType.getValues().map(type => { return `'${type.name}'` })
      typeClause = `WHERE HEAD(labels(\`node\`)) IN ['${typeNames.join('\', \'')}']`
    }

    return typeClause
  }
}

export default SearchQuery
