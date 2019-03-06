class SearchQuery {
  constructor (params, resolveInfo) {
    this.params = params
    this.resolveInfo = resolveInfo

    this.doEvaluateTypeSubset = !(!(this.params.onTypes instanceof Array) || this.params.onTypes.length === 0 || this.params.onTypes.length === this.resolveInfo.schema._typeMap.MetadataInterfaceType._values.length)
    this.doEvaluateFieldSubset = !(!(this.params.onFields instanceof Array) || this.params.onFields.length === 0 || this.params.onFields.length === this.resolveInfo.schema._typeMap.SearchableMetadataFields._values.length)
  }

  get query () {
    return this._generateQuery()
  }

  _generateQuery () {
    // if only a subset of fields need to be evaluated: build query clause for [substring]~ on all eligible fields
    const subStringClause = `'${this.params.substring.replace(/[^A-Za-z0-9]/g, ' ')}~'`
    let indexQueryClause = subStringClause
    if (this.doEvaluateTypeSubset || this.doEvaluateFieldSubset) {
      const fieldNames = this.doEvaluateFieldSubset ? this.params.onFields : this.resolveInfo.schema._typeMap.SearchableMetadataFields._values.map(field => { return field.name })
      let queryClauses = []
      fieldNames.map(field => {
        queryClauses.push(`${field}:${subStringClause}`)
      })
      indexQueryClause = queryClauses.join(' OR ')
    }

    // if only a subset of types need to be evaluated: build type clause for [substring]~ on all eligible fields
    let typeClause = ''
    if (this.doEvaluateTypeSubset) {
      const typeNames = this.resolveInfo.schema._typeMap.MetadataInterfaceType._values.map(type => { return `'${type.name}'` })
      typeClause = `MATCH (n) WHERE HEAD(labels(n)) IN [${typeNames.join(', ')}]`
    }

    // compose query
    return [
      `CALL db.index.fulltext.queryNodes("metadataSearchFields", "${indexQueryClause}")`,
      `YIELD \`node\`, \`score\``,
      typeClause,
      `RETURN n as node, HEAD(labels(node)) as \`label\`, \`score\``,
      `ORDER BY \`score\` DESC`
    ].join(' ')
  }
}

export default SearchQuery
