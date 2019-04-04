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
    // default result
    this.result = {
      data: `{"error":{"message":"Not found"}}`,
      status: '404'
    }
  }

  /**
   * @returns {{data: string, status: string}|*}
   */
  get find () {
    if (validator.isUUID(this.identifier)) {
      const payload = this._retrievePayload(this._runQuery(this._getQuery()))

      this.result.status = '200'
      this.result.data = payload
      this.result.data = `{"data":{"identifier":"${this.identifier}"}}}`
    }

    return this.result
  }

  _getQuery () {
    return `MATCH (n) WHERE n.identifier = "${this.identifier}" RETURN n`
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
    let promise = session.run(query)
      .then(result => {
        let rt = result.records.map(record => {
          return retrievePayload(record.get('_payload'), queryType)
        })
        const returnValue = rt[0]
        return returnValue
      })
      .catch(function (error) {
        throw Error(error.toString())
      })

    return promise
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
      default:
        warning('Unknown payloadType encountered')
    }
  }
}

export default GetRequest
