import { info, warning } from '../index'
import { driver } from '../driver'
import GetTypeQuery from '../queries/GetTypeQuery'
import GetFullNodeQuery from '../queries/GetFullNodeQuery'

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
    return this._findNodeType()
  }

  /**
   * @returns {Promise<{from, to} | never>}
   */
  _findNodeType () {
    const getTypeQuery = new GetTypeQuery(this.identifier)
    const query = getTypeQuery.query
    info(`_findNodeType query: ${query}`)
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
        return this._qetNodeProperties(identifyingResult._schemaType)
      }, reason => {
        throw reason
      })
      .catch(function (error) {
        info('_findNodeType caught error' + error.toString())
        throw Error(error.toString())
      })
  }

  /**
   * @param type
   * @param identifier
   * @returns {Promise<StatementResult | never>}
   * @private
   */
  _qetNodeProperties (type) {
    const getFullNodeQuery = new GetFullNodeQuery(type, this.identifier)
    const query = getFullNodeQuery.query
    info(`_qetFullNodeQuery: ${query}`)
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
        info('__qetNodeProperties caught error' + error.toString())
        throw Error(error.toString())
      })
  }
}

export default GetRequest
