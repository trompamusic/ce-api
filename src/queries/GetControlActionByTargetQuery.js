import StringHelper from '../helpers/StringHelper'
import QueryHelper from '../helpers/QueryHelper'

class GetControlActionByTargetQuery {
  constructor (params, resolveInfo) {
    this.params = params
    this.resolveInfo = resolveInfo

    this.queryHelper = new QueryHelper()
    this.baseNode = this.resolveInfo.fieldNodes[0]
    this.baseType = this.baseNode.name.value
  }

  get query () {
    return this._generateQuery()
  }

  _generateQuery () {
    // retrieve constants from parameters
    const alias = StringHelper.lowercaseFirstCharacter(this.resolveInfo.fieldName)

    // split the params into targetParams and baseParams
    const { targetIdentifier, ...baseParams } = this.params

    // compose query string
    return [
      `MATCH (\`${alias}\`:\`${this.baseType}\` {`,
      this.queryHelper.generateConditionalClause(baseParams),
      `})`,
      this.queryHelper.generateRelationClause(this.baseType, 'target'),
      `(\`entryPoint\`:\`EntryPoint\` {`,
      this.queryHelper.generateConditionalClause({ identifier: targetIdentifier }),
      `})`,
      `WITH \`${alias}\`, HEAD(labels(\`${alias}\`)) as _schemaType`,
      `RETURN \`${alias}\` {`,
      this.queryHelper.selectedPropertiesClause(this.baseType, alias, this.baseNode.selectionSet),
      `}`,
      `AS \`${alias}\``,
      this.queryHelper.generatePaginationClause(this.params)
    ].join(` `)
  }
}

export default GetControlActionByTargetQuery