import { info, debug, warning } from '../index'
import QueryHelper from '../helpers/QueryHelper'

const defaultDepth = 1

class GetFullNodeQuery {
  /**
   * @param type
   * @param identifier
   * @param host
   * @param depth
   */
  constructor (type, identifier, host, depth = defaultDepth) {
    this.type = type
    this.identifier = identifier
    this.depth = depth
    this.host = host

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
    const alias = `node`
    return [
      `MATCH (\`${alias}\`:\`${this.type}\`)`,
      `WHERE \`${alias}\`.\`identifier\` = "${this.identifier}"`,
      `RETURN \`${alias}\` {${this.queryHelper.typeFieldsClause(this.type, alias, this.host, this.depth)}} AS \`_payload\``
    ].join(' ')
  }
}

export default GetFullNodeQuery
