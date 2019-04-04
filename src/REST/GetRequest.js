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
      this.result.status = '200'
      this.result.data = `{"data":{"identifier":"${this.identifier}"}}}`
    }

    return this.result
  }
}

export default GetRequest
