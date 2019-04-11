import { info, debug, warning } from '../index'
import QueryHelper from '../helpers/QueryHelper'

const defaultDepth = 1

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

    this.queryHelper = new QueryHelper()
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
    debug('GetFullNodeQuery._generateQuery')
    debug(this.queryHelper.typeFieldsClause(this.type, 'n', this.depth))

    return [
      `MATCH (\`n\`:\`${this.type}\`)`,
      `WHERE \`n\`.\`identifier\` = "${this.identifier}"`,
      `RETURN \`n\` {\`_schemaType\`:HEAD(labels(\`n\`)), \`identifier\`:\`n\`.\`identifier\`} AS \`_payload\``
    ].join(' ')
  }
}

export default GetFullNodeQuery
