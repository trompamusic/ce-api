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
  }

  /**
   * @returns {{data: string, status: string}|*}
   */
  get find () {
    return this._runQuery(this._getQuery())
    // if (validator.isUUID(this.identifier)) {
    //   // const query = this._getQuery()
    //   // info(query)
    //
    //   return this._runQuery(this._getQuery())
    // }
    //
    // return this.result
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
          //return record.get('_payload')
          return this._retrievePayload(record.get('_payload'), 'getRequest')
        })
        const returnValue = rt[0]
        return returnValue
      })
      .catch(function (error) {
        throw Error(error.toString())
      })
  }

  /**
   * @param payload
   * @param payloadType
   * @returns {*}
   */
  _retrievePayload (payload, payloadType) {
    switch (payloadType) {
      case 'add':
      case 'remove':
        return {
          from: retrieveNodeData(payload.from),
          to: retrieveNodeData(payload.to)
        }
      case 'RequestControlAction':
        return payload.properties
      case 'UpdateControlAction':
        return payload
      case 'getRequest':
        return payload
      default:
        warning('Unknown payloadType encountered')
    }
  }
}

export default GetRequest
