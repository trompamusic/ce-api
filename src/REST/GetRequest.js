import { info, warning } from '../index'
import QueryHelper from '../helpers/QueryHelper'
import { driver } from '../driver'
import validator from 'validator'

class GetRequest {
  /**
   * @param identifier
   */
  constructor (identifier) {
    this.identifier = identifier
    this.session = driver.session()
  }

  /**
   * @returns {Promise<{from, to}|never>}
   */
  get find () {
    return this._findNode()
  }

  /**
   * @returns {string}
   * @private
   */
  _getTypeQuery () {
    return `MATCH (\`n\`) WHERE \`n\`.\`identifier\` = "${this.identifier}" RETURN \`n\` {\`_schemaType\`:HEAD(labels(\`n\`))} AS \`_payload\``
  }

  /**
   * @param type
   * @returns {string}
   * @private
   */
  _getFullPropertyQuery (type) {
    return [
      `MATCH (\`n\`:\`${type}\`)`,
      `WHERE \`n\`.\`identifier\` = "${this.identifier}"`,
      `RETURN \`n\` {\`_schemaType\`:HEAD(labels(\`n\`)), \`identifier\`:\`n\`.\`identifier\`} AS \`_payload\``
    ].join(' ')
  }

  /**
   * @param query
   * @param queryType
   * @param publishChannel
   * @returns {Promise<{from, to} | never>}
   */
  _findNode () {
    const query = this._getTypeQuery()
    info(`_findNode query: ${query}`)
    return this.session.run(query)
      // find a node with matching identifier
      .then(identifyingResult => {
        let rt = identifyingResult.records.map(record => {
          return record.get('_payload')
        })
        // only interpret the first result
        return rt[0]
      })
      // determine type of node and query for all scalar properties and 1st order relations
      .then(identifyingResult => {
        if (typeof identifyingResult === 'undefined' || identifyingResult._schemaType === 'undefined') {
          return Promise.reject(new Error('Node not found'))
        }
        return this._qetFullProperties(identifyingResult._schemaType)
      }, reason => {
        throw reason
      })
      .catch(function (error) {
        info('_findNode caught error' + error.toString())
        throw Error(error.toString())
      })
  }

  /**
   * @param type
   * @param identifier
   * @returns {Promise<StatementResult | never>}
   * @private
   */
  _qetFullProperties (type, identifier) {
    const query = this._getFullPropertyQuery(type, identifier)
    info(`_qetFullProperties query: ${query}`)
    return this.session.run(query)
      // find the node with all properties and 1st order relations
      .then(fullResult => {
        let rt = fullResult.records.map(record => {
          return record.get('_payload')
        })
        // only interpret the first result
        info('fullResult')
        info(rt[0])
        return rt[0]
      })
      .catch(function (error) {
        info('__qetFullProperties caught error' + error.toString())
        throw Error(error.toString())
      })
  }
}

export default GetRequest
