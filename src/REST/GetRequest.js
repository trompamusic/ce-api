import { info } from '../utils/logger'
import { driver } from '../driver'
import GetTypeQuery from '../queries/GetTypeQuery'
import GetFullNodeQuery from '../queries/GetFullNodeQuery'
import SchemaHelper from '../helpers/SchemaHelper'

class GetRequest {
  /**
   * @param identifier
   */
  constructor (identifier, host) {
    this.identifier = identifier
    this.session = driver.session()
    this.host = host
    this.schemaHelper = new SchemaHelper()
  }

  /**
   * @returns {Promise<{from, to}|never>}
   */
  find (req, res) {
    const getTypeQuery = new GetTypeQuery(this.identifier)
    const query = getTypeQuery.query
    const accept = req.headers['accept'] || 'application/json'
    info(`_findQuery accept: ${accept}`)
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
        const type = typeResult && typeResult._schemaType

        if (!type) {
          return Promise.reject(new Error('Node not found'))
        }

        return this._getNodeProperties(type)
          .then(data => {
            info('Accept: ' + accept)

            // respond with json data
            if (accept === 'application/json') {
              return data
            }

            // respond with JSON-LD data
            if (accept === 'application/json-ld') {
              const schemaTypes = this.schemaHelper.getTypeDescription(type).split(',')
              const scopedContexts = {
                dc: 'http://purl.org/dc/elements/1.1/',
                prov: 'https://www.w3.org/TR/prov-o/#',
                skos: 'http://www.w3.org/2004/02/skos/core#',
                rdf: 'https://www.w3.org/2000/01/rdf-schema'
              }
              const prefixes = Object.keys(scopedContexts)

              const jsonLdData = {
                '@context': [
                  'https://schema.org/',
                  scopedContexts
                ],
                '@type': schemaTypes
              }

              Object.keys(data).forEach(key => {
                const property = this.schemaHelper.findPropertyType(type, key)

                let elementValue = data[key]

                if (elementValue && this.schemaHelper.isRelationalProperty(property)) {
                  if (Array.isArray(elementValue)) {
                    elementValue = elementValue.map(id => ({
                      '@id': id
                    }))
                  } else if (typeof elementValue === 'string') {
                    elementValue = {
                      '@id': elementValue
                    }
                  }
                }

                property.description.split(',').forEach(uri => {
                  const prefix = prefixes.find(prefix => uri.indexOf(scopedContexts[prefix]) === 0)

                  if (prefix) {
                    // prefixed element
                    jsonLdData[`${prefix}:${key}`] = elementValue
                  } else {
                    if (uri.indexOf('https://schema.org') !== 0) {
                      console.log('Found new URI without context: ' + uri)
                    }
                    // https://schema.org element
                    jsonLdData[key] = elementValue
                  }
                })
              })

              return jsonLdData
            }

            throw new Error('Not implemented')
          })
      }, reason => {
        throw reason
      })
      .catch(function (error) {
        console.log(typeof error)
        info('_findNodeType caught error' + error.message)
        throw error
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
}

export default GetRequest
