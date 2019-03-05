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
    // If all metadataInterfaced types AND all metadata textfields need to be evaluated: [substring]~ suffies
    const subStringClause = `${this.params.substring}~`
    let indexQueryClause = `${this.params.substring}~`

    // if only a subset of types and/or fields need to be evaluated: build query clause for [substring]~ on all eligible types/fields
    if (this.doEvaluateTypeSubset || this.doEvaluateFieldSubset) {
      const typeNames = this.doEvaluateTypeSubset ? this.params.onTypes : this.resolveInfo.schema._typeMap.MetadataInterfaceType._values.map(type => { return type.name })
      const fieldNames = this.doEvaluateFieldSubset ? this.params.onFields : this.resolveInfo.schema._typeMap.SearchableMetadataFields._values.map(field => { return field.name })
      let queryClauses = []
      typeNames.map(type => {
        fieldNames.map(field => {
          queryClauses.push(`${type}.${field}:${subStringClause}`)
        })
      })
      // overwrite indexQueryClause with concatenated query clauses
      indexQueryClause = queryClauses.join(' OR ')
    }

    return `CALL apoc.index.search("metadata", "${indexQueryClause}") YIELD \`node\`, \`weight\` RETURN \`node\`, \`weight\` ORDER BY \`weight\` DESC SKIP $offset LIMIT $first`
  }
}

export default SearchQuery
