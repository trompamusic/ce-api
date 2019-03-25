import StringHelper from '../helpers/StringHelper'
import QueryHelper from '../helpers/QueryHelper'

const paginationParameters = { 'offset': 'SKIP', 'first': 'LIMIT' }

class GetQuery {
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

    // compose query string
    return [
      `MATCH (\`${alias}\`:\`${this.baseType}\` {`,
      this._generateConditionalClause(),
      `})`,
      `WITH \`${alias}\`, HEAD(labels(\`${alias}\`)) as _schemaType`,
      `RETURN \`${alias}\` {`,
      this.queryHelper.selectedPropertiesClause(this.baseType, alias, this.baseNode.selectionSet),
      `}`,
      `AS \`${alias}\``,
      this._generatePaginationClause()
    ].join(` `)
  }

  _generateConditionalClause () {
    let conditionalClause = ''

    // process all parameters, except pagination parameters
    for (let param in this.params) {
      // ignore pagination parameters
      if (param in paginationParameters) {
        continue
      }
      conditionalClause += `\`${param}\`:"${this.params[param]}"`
    }

    return conditionalClause
  }

  _generatePaginationClause () {
    let paginationClause = ''

    for (let paginationParam in paginationParameters) {
      if (paginationParam in this.params) {
        paginationClause += ` ${paginationParameters[paginationParam]} ${this.params[paginationParam]}`
      }
    }

    return paginationClause
  }
}

export default GetQuery
