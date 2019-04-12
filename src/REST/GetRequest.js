import { info } from '../index'
import { driver } from '../driver'
import GetTypeQuery from '../queries/GetTypeQuery'
import GetFullNodeQuery from '../queries/GetFullNodeQuery'

class GetRequest {
  /**
   * @param identifier
   */
  constructor (identifier, host) {
    this.identifier = identifier
    this.session = driver.session()
    this.host = host
  }

  /**
   * @returns {Promise<{from, to}|never>}
   */
  get find () {
    const getTypeQuery = new GetTypeQuery(this.identifier)
    const query = getTypeQuery.query
    info(`_findNodeType query: ${query}`)
    return this.session.run(query)
    // find a node with matching identifier
      .then(typeResult => {
        let rt = typeResult.records.map(record => {
          return record.get('_payload')
        })
        // only interpret the first result
        return rt[0]
      })
      // determine type of node and query for all scalar properties and 1st order relations
      .then(typeResult => {
        if (typeof typeResult === 'undefined' || typeResult._schemaType === 'undefined') {
          return Promise.reject('Node not found')
        }
        return this._getNodeProperties(typeResult._schemaType)
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
   * @returns {Promise<StatementResult | never>}
   * @private
   */
  _getNodeProperties (type) {
    const getFullNodeQuery = new GetFullNodeQuery(type, this.identifier, this.host, 2)
    const query = getFullNodeQuery.query
    info(`_qetFullNodeQuery: ${query}`)
    return this.session.run(query)
      // find the node with all properties and 1st order relations
      .then(fullResult => {
        let rt = fullResult.records.map(record => {
          return record.get('_payload')
        })
        // only interpret the first result
        return rt[0]
      })
      .catch(function (error) {
        info('_getNodeProperties caught error' + error.toString())
        throw Error(error.toString())
      })
  }
}

export default GetRequest