import { info } from '../../utils/logger'
import { driver } from '../../driver'
import GetTypeQuery from '../../queries/GetTypeQuery'
import GetFullNodeQuery from '../../queries/GetFullNodeQuery'
import SchemaHelper from '../../helpers/SchemaHelper'

export const getDocument = (identifier, host) => {
  const session = driver.session()
  const schemaHelper = new SchemaHelper()

  const getTypeQuery = new GetTypeQuery(identifier, schemaHelper.getTypeNames())
  const query = getTypeQuery.query

  info(`_findNodeType query: ${query}`)

  return session.run(query)
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
      const type = typeResult && typeResult._schemaType

      if (!type) {
        return Promise.reject(new Error('Node not found'))
      }

      return getNodeProperties(session, type, identifier, host)
        .then(data => ({ data, type }))
    }, reason => {
      throw reason
    })
    .catch(function (error) {
      info('_findNodeType caught error' + error.message)
      throw error
    })
}

const getNodeProperties = (session, type, identifier, host) => {
  const getFullNodeQuery = new GetFullNodeQuery(type, identifier, host, 2)
  const query = getFullNodeQuery.query
  info(`_qetFullNodeQuery: ${query}`)

  return session.run(query)
    .then(fullResult => {
      // find the node with all properties and 1st order relations
      let rt = fullResult.records.map(record => {
        return record.get('_payload')
      })
      // only interpret the first result
      return rt[0]
    })
    .catch(function (error) {
      info('_getNodeProperties caught error' + error.message)
      throw error
    })
}
