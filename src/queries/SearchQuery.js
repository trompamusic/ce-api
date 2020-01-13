class SearchQuery {
  /**
   * @param params
   * @param resolveInfo
   */
  constructor (params, resolveInfo) {
    this.params = params
    this.resolveInfo = resolveInfo

    this.doEvaluateTypeSubset = !(!(this.params.onTypes instanceof Array) || this.params.onTypes.length === 0 || this.params.onTypes.length === this.resolveInfo.schema._typeMap.MetadataInterfaceType._values.length)
    this.doEvaluateFieldSubset = !(!(this.params.onFields instanceof Array) || this.params.onFields.length === 0 || this.params.onFields.length === this.resolveInfo.schema._typeMap.SearchableMetadataFields._values.length)
  }

  /**
   * @returns {string}
   */
  get query () {
    return [
      `CALL db.index.fulltext.queryNodes("metadataSearchFields", "${this._generateIndexQueryClause(this._generateSubStringClause())}")`,
      `YIELD \`node\`, \`score\``,
      this._generateTypeClause(),
      `RETURN node { .*, FRAGMENT_TYPE: HEAD(labels(node)), _searchScore: \`score\` }`,
      `ORDER BY \`score\` DESC`,
      this.params.offset ? `SKIP toInteger($offset)` : ``,
      this.params.first ? `LIMIT toInteger($first)` : ``
    ].join(' ')
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

    // prepare search substring
    let subStringClause = `${this.params.substring.replace(/[^A-Za-z0-9]/g, ' ')}~`

    if (subStringClause.includes(' ')) {
      subStringClause = `'${subStringClause}'`
    }

    return subStringClause
  }

  /**
   * @param subStringClause
   * @returns {*|string}
   * @private
   */
  _generateIndexQueryClause (subStringClause) {
    // if only a subset of fields need to be evaluated: build query clause for [substring]~ on all eligible fields
    let indexQueryClause = subStringClause
    if (this.doEvaluateFieldSubset) {
      const fieldNames = this.doEvaluateFieldSubset ? this.params.onFields : this.resolveInfo.schema._typeMap.SearchableMetadataFields._values.map(field => { return field.name })
      let queryClauses = []
      fieldNames.map(field => {
        queryClauses.push(`${field}:${subStringClause}`)
      })
      indexQueryClause = queryClauses.join(' OR ')
    }

    return indexQueryClause
  }

  /**
   * @returns {string}
   * @private
   */
  _generateTypeClause () {
    // if only a subset of types need to be evaluated: build type clause for [substring]~ on all eligible fields
    let typeClause = ''
    if (this.doEvaluateTypeSubset) {
      const typeNames = this.doEvaluateTypeSubset ? this.params.onTypes : this.resolveInfo.schema._typeMap.MetadataInterfaceType._values.map(type => { return `'${type.name}'` })
      typeClause = `WHERE HEAD(labels(\`node\`)) IN ['${typeNames.join(`', '`)}']`
    }

    return typeClause
  }
}

export default SearchQuery
