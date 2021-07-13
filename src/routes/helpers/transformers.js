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
 * @param {string} baseUrl: the base URL of the server (used to prefix ids if needed)
 * @returns {Object} JSON-LD structured document
 */
export const transformJsonLD = (type, data, baseUrl) => {
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

  if (type === "DefinedTermSet") {
    data = preprocessDefinedTermSet(data);
  }

  if (type === "ItemList") {
    data = preprocessItemList(data, baseUrl);
  }

  // A property that we want to force to be relational (render as {"@id": value})
  const jsonldRelationalProperties = config.relationalProperties || []
  // A property that we want to force as not being relational, even if GraphQL thinks it is
  const jsonldNonRelationalProperties = config.nonRelationalProperties || []

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
    delete data.additionalType;
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
    // Sometimes GraphQL knows that this is a relational property but we have preprocessed the data in
    // a way that we don't want this behaviour. In this case, use nonRelationalProperties
    // in the relevant json specification file.
    if (elementValue && !jsonldNonRelationalProperties.includes(key) &&
        (schemaHelper.isRelationalProperty(property) || jsonldRelationalProperties.includes(key))) {
      if (Array.isArray(elementValue)) {
        elementValue = elementValue.map(id => ({
          '@id': id
        }))
      } else if (typeof elementValue === 'string') {
        elementValue = {
          '@id': elementValue
        }
      } else if (typeof elementValue === 'object' && elementValue.identifier) {
        elementValue = {
          '@id': elementValue.identifier
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

/**
 * Preprocess data for an ItemList before converting to JSON-LD.
 *
 * The ItemList.itemListElement field could be a reference to an external
 * object, in which case it should be rendered as
 *   {"@id": "external object identifier"}
 * or it could be a ListItem object, in which case we should render the contents
 * of the object inline:
 *   {"@id": "CE ListItem identifier",
 *    "name": Name of the item}
 * or it could be a ListItem with its `item` field pointing to another element:
 *   {"@id": "CE ListItem identifier",
 *    "item": {"@id": "ID of the thing that this points to}
 *   }
 *
 * @param data
 * @param baseUrl
 */
export function preprocessItemList(data, baseUrl) {
  if (data.itemListElement && Array.isArray(data.itemListElement)) {
    data.itemListElement = data.itemListElement.map(element => {
      if (element.FRAGMENT_TYPE === "ListItem") {
        if (element.item && Array.isArray(element.item) && element.item.length) {
          // We only expect to have one related item
          element.item = element.item[0]
          element.item.identifier = baseUrl + "/" + element.item.identifier;
        }
        delete element.FRAGMENT_TYPE;
        element.identifier = baseUrl + "/" + element.identifier;
        const listItemJson = transformJsonLD("ListItem", element, baseUrl)
        listItemJson["@id"] = listItemJson.identifier
        // We use transformJsonLD but we don't want the context, this is present in the
        // surrounding object
        delete listItemJson["@context"];
        return listItemJson
      } else {
        // This is some other item in the CE which isn't a ListItem, just link to it
        return {"@id": baseUrl + "/" + element.identifier}
      }
    });
  }
  if (data["created"] && data["created"].formatted) {
    data["created"] = data["created"].formatted
  }
  if (data["modified"] && data["modified"].formatted) {
    data["modified"] = data["modified"].formatted
  }
  return data;
}


/**
 * Preprocess data for a DefinedTermSet before converting to JSON-LD.
 * If a DefinedTermSet has a motivation set (either broaderMotivation or
 * broaderUrl), then add oa:Motivation to additionalTypes.
 *
 * If broaderMotivation is set (graphql enum), prefix it with the oa: namespace.
 * @param data the result from document.getDocument
 */
export function preprocessDefinedTermSet(data) {
  const additionalType = data["additionalType"];
  const hasMotivationAdditionalType = additionalType && (additionalType.includes("http://www.w3.org/ns/oa#Motivation") ||
      additionalType.includes("https://www.w3.org/ns/oa#Motivation"))
  if ((data["broaderUrl"] || data["broaderMotivation"]) && !hasMotivationAdditionalType) {
    if (additionalType) {
      data["additionalType"].push("https://www.w3.org/ns/oa#Motivation");
    } else {
      data["additionalType"] = ["https://www.w3.org/ns/oa#Motivation"];
    }
  }

  if (data["broaderMotivation"]) {
    data["broaderMotivation"] = "oa:" + data["broaderMotivation"];
  }
  return data
}
