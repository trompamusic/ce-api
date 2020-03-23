import SchemaHelper from '../../helpers/SchemaHelper'
import { warning } from '../../utils/logger'
import { isDateTime } from 'neo4j-driver/lib/temporal-types'
import { schema } from '../../schema'

// Used scopes dict
const scopedContexts = {
  dc: 'http://purl.org/dc/elements/1.1/',
  prov: 'https://www.w3.org/TR/prov-o/#',
  skos: 'http://www.w3.org/2004/02/skos/core#',
  rdf: 'https://www.w3.org/2000/01/rdf-schema'
}

/**
 * Transform document to a JSON-LD structured document
 * @param {string} type
 * @param {Object} data
 * @returns {Object} JSON-LD structured document
 */
export const transformJsonLD = (type, data) => {
  const schemaHelper = new SchemaHelper()
  const schemaTypes = schemaHelper.getTypeDescription(type).split(',')
  const prefixes = Object.keys(scopedContexts)

  // Base JSON-LD document
  const jsonLdData = {
    '@context': [
      'https://schema.org/',
      scopedContexts
    ],
    '@type': schemaTypes
  }

  const convertScalarToPerson = value => {
    const personProperty = /^https?/.test(value) ? 'url' : 'callSign'

    return {
      '@type': 'Person',
      [personProperty]: value
    }
  }

  // Iterate all keys in the data document
  Object.keys(data).forEach(key => {
    // Get the property for the current key
    const property = schemaHelper.findPropertyType(type, key)

    // Use the current value by default
    let elementValue = data[key]

    // A DateTime object should be formatted as an iso8601 date
    // TODO: there is also a LocalDateTime, but we don't appear to use it
    if (isDateTime(elementValue)) {
      elementValue = elementValue.toString()
    }

    // Transform the value when it's a relational property
    if (elementValue && schemaHelper.isRelationalProperty(property)) {
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

    // For the ControlAction we convert the `agent` property into a Person type
    // The `agent` property is a String, which can either be an URL (vcard/webid) or the persons callSign
    if (key === 'agent' || key === 'participant') {
      elementValue = Array.isArray(elementValue) ? elementValue.map(convertScalarToPerson)
        : convertScalarToPerson(elementValue)
    }

    // Iterate over all property scopes
    property.description.split(',').forEach(uri => {
      // Find the scope in the predefined scoped context dictionary
      const prefix = prefixes.find(prefix => uri.indexOf(scopedContexts[prefix]) === 0)

      // Set the property with the namespace
      if (prefix) {
        const context = scopedContexts[prefix]
        const jsonLDKey = uri.substring(context.length)
        jsonLdData[`${prefix}:${jsonLDKey}`] = elementValue

        return
      }

      if (uri.indexOf('https://schema.org') !== 0) {
        // We have found an unknown namespace, log it to the console
        warning('Found new URI without context: ' + uri)
        return
      }
      // For {https://schema.org} we don't have to define a namespace (this is the default context)
      jsonLdData[key] = elementValue
    })
  })

  return jsonLdData
}
