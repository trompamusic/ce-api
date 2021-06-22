import SchemaHelper from '../../helpers/SchemaHelper'
import { warning } from '../../utils/logger'
import { isDateTime } from 'neo4j-driver/lib/temporal-types'

// Used scopes dict
const scopedContexts = {
  dc: 'http://purl.org/dc/terms/',
  prov: 'http://www.w3.org/ns/prov#',
  skos: 'http://www.w3.org/2004/02/skos/core#',
  rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
  bib: 'https://bib.schema.org/',
  trompa: 'https://vocab.trompamusic.eu/vocab#',
  ldp: 'http://www.w3.org/ns/ldp#',
  rdau: 'http://rdaregistry.info/Elements/u/'
}

const defaultContext = 'https://schema.org'

/**
 * Convert the given value to a Person type with either an URL or callSign value
 * @param value
 * @return {Object}
 */
const convertScalarToPerson = value => {
  const personProperty = /^https?/.test(value) ? 'url' : 'callSign'

  return {
    '@type': 'Person',
    [personProperty]: value
  }
}

/**
 * Check if a value is empty (null or empty array)
 * @param value
 */
const isEmpty = value => {
  return value === null || (Array.isArray(value) && value.length === 0)
}

/**
 * Transform document to a JSON-LD structured document
 * @param {string} type
 * @param {Object} data
 * @param {string} required_language: the language that this data should be in
 * @returns {Object} JSON-LD structured document
 */
export const transformJsonLD = (type, data) => {
  const schemaHelper = new SchemaHelper()
  const prefixes = Object.keys(scopedContexts)

  let config
  try {
    config = require(`./jsonld/${type}.json`)
  } catch (e) {
    if (e.code !== 'MODULE_NOT_FOUND') {
      throw e
    }
    config = null
  }
  if (!config) {
    throw new Error(`JSON LD not supported for type "${type}"`)
  }
  const jsonldRelationalProperties = config.relationalProperties || []

  // Base JSON-LD document
  const jsonLdData = {
    '@context': [
      defaultContext,
      scopedContexts
    ],
    ...config.head
  }

  // extend the `@type` field with all stored additionalTypes. These are validated before saved, so we can safely assume
  // the values are valid URLs.
  if (Array.isArray(data.additionalType)) {
    jsonLdData['@type'] = [...jsonLdData['@type'], ...data.additionalType]
  }

  // Iterate all keys in the data document
  Object.keys(data).forEach(key => {
    // Get the property for the current key
    const property = schemaHelper.findPropertyType(type, key)

    // Use the current value by default
    let elementValue = data[key]

    // A DateTime object should be formatted as an iso8601 date
    // TODO: there is also a LocalDateTime, but we don't appear to use it
    if (elementValue && isDateTime(elementValue)) {
      elementValue = elementValue.toString()
    }

    // Transform the value when it's a relational property
    if (elementValue && (schemaHelper.isRelationalProperty(property) || jsonldRelationalProperties.includes(key))) {
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
      elementValue = Array.isArray(elementValue)
        ? elementValue.map(convertScalarToPerson)
        : convertScalarToPerson(elementValue)
    }

    const jsonldProperty = config.properties[key] || []

    // Iterate over all property scopes
    jsonldProperty.forEach(uri => {
      // Find the scope in the predefined scoped context dictionary
      const prefix = prefixes.find(prefix => uri.indexOf(scopedContexts[prefix]) === 0)

      // Set the property with the namespace
      if (prefix) {
        const context = scopedContexts[prefix]
        const jsonLDKey = uri.substring(context.length)
        if (!isEmpty(elementValue)) {
          jsonLdData[`${prefix}:${jsonLDKey}`] = elementValue
        }

        return
      }

      if (uri.indexOf(defaultContext) !== 0) {
        // We have found an unknown namespace, log it to the console
        warning('Found new URI without context: ' + uri)
        return
      }
      // For {https://schema.org} we don't have to define a namespace (this is the default context)
      // in @context, we show the default context without a trailing /, but need to remove it
      //  to get the correct type name, hence the + 1
      const jsonLDKey = uri.substring(defaultContext.length + 1)
      if (!isEmpty(elementValue)) {
        jsonLdData[jsonLDKey] = elementValue
      }
    })
  })

  return jsonLdData
}
