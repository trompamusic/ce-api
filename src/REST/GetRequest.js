import { info } from '../index'
import { driver } from '../driver'

class GetRequest {
  /**
   * @param identifier
   */
  constructor (identifier) {
    this.identifier = identifier
  }

  /**
   * @returns {{data: string, status: string}|*}
   */
  get find () {
    return this._runQuery(this._getQuery())
  }

  _getQuery () {
    return `MATCH (n) WHERE n.identifier = "${this.identifier}" RETURN n AS _payload`
  }

  /**
   * @param query
   * @param queryType
   * @param publishChannel
   * @returns {Promise<{from, to} | never>}
   */
  _runQuery (query, queryType, publishChannel) {
    info(`query: ${query}`)
    let session = driver.session()
    return session.run(query)
      .then(result => {
        let rt = result.records.map(record => {
          return record.get('_payload')
        })
        const returnValue = rt[0]
        return returnValue
      })
      .catch(function (error) {
        throw Error(error.toString())
      })
  }
}

export default GetRequest
