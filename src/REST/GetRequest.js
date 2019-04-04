import { info, warning } from '../index'
import QueryHelper from '../helpers/QueryHelper'
import { driver } from '../driver'
import { pubsub } from '../resolvers'

class GetRequest {
  /**
   * @param identifier
   */
  constructor (identifier) {
    this.identifier = identifier
  }

  /**
   * @returns {string}
   */
  get find () {
    const data = `{"data":{"identifier":"${this.identifier}"}}}`

    return {
      status: 200,
      data: data
    }
  }
}

export default GetRequest
