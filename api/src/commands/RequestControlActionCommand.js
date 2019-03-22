import { debug, info, warning } from '../index'
import SchemaHelper from '../helpers/SchemaHelper'
import QueryHelper from '../helpers/QueryHelper'
import { driver } from '../driver'
import StringHelper from "../helpers/StringHelper";
// import { pubsub } from "../resolvers";

class RequestControlActionCommand {

  /**
   * @param params
   */
  constructor (params) {
    this.params = params
    // this.driver = driver
    this.session = driver.session()

    this.schemaHelper = new SchemaHelper()
    this.queryHelper = new QueryHelper()
  }

  /**
   * @returns {Promise<StatementResult | never>}
   */
  get create () {
    const requestInput = this._retrieveRequestInput()
    const entryPointQuery = this._generateTemplateQuery(requestInput)
    debug(entryPointQuery)
    return this.session.run(entryPointQuery)
      // retrieve template ControlAction
      .then(result => {
        const payloads = result.records.map(record => {
          // debug('record.get(\'_payload\')')
          // debug(record.get('_payload'))
          return record.get('_payload')
        })

        const template = payloads[0]
        if (typeof template !== 'object' || typeof template.identifier !== 'string' || template.identifier !== requestInput.entryPointIdentifier) {
          return Promise.reject(new Error('Template EntryPoint/ControlAction was not found'))
        }

        return template
      })
      // validate request payload against template and create requested ControlAction
      .then(template => {
        this._validateRequestInput(template, requestInput)

        return this._createControlAction(template, requestInput)
      }, reason => {
        throw reason
      })
      // create ControlAction
      // .then(template => {
      //   debug('create ControlAction:')
      //   debug(payload)
      //   return this._createControlAction(template, payload)
      // })
      .catch(function (error) {
        throw Error(error.toString())
      })
  }

  /**
   * @returns {Object}
   * @private
   */
  _retrieveRequestInput () {
    const requestInput = this.params.controlAction
    if (typeof requestInput !== 'object' || typeof requestInput.entryPointIdentifier !== 'string' || typeof requestInput.potentialActionIdentifier !== 'string') {
      throw Error('Request Input error: either empty or missing `entryPointIdentifier` or `potentialActionIdentifier` parameter')
    }

    // hydrate propertyObject aliases
    let nodeCounter = 1
    if (Array.isArray(requestInput.propertyObject)) {
      requestInput.propertyObject = requestInput.propertyObject.map(node => {
        node.alias = `node_${nodeCounter}`
        node.propertyValueAlias = `propertyValue_${nodeCounter}`
        nodeCounter++

        return node
      })
    }
    // hydrate propertyObject aliases
    if (Array.isArray(requestInput.propertyValueObject)) {
      requestInput.propertyValueObject = requestInput.propertyValueObject.map(node => {
        node.propertyValueAlias = `propertyValue_${nodeCounter}`
        nodeCounter++

        return node
      })
    }

    return requestInput
  }

  /**
   * @param requestInput
   * @returns {string}
   * @private
   */
  _generateTemplateQuery (requestInput) {
    return [
      `MATCH (sa:SoftwareApplication)<-[:ACTION_APPLICATION]-(ep:EntryPoint {identifier:"${requestInput.entryPointIdentifier}"})-[:POTENTIAL_ACTION]->(ca:ControlAction {identifier:"${requestInput.potentialActionIdentifier}"})`,
      `RETURN ep {_schemaType:HEAD(labels(ep)), identifier:ep.identifier, name:ep.name, contributor:ep.contributor, title:ep.title, creator:ep.creator, source:ep.source, subject:ep.subject, format:ep.format, language:ep.language,`,
      `actionApplication:sa,`,
      `potentialAction:{_schemaType:HEAD(labels(ca)), identifier:ca.identifier, name:ca.name, contributor:ca.contributor, title:ca.title, creator:ca.creator, source:ca.source, subject:ca.subject, format:ca.format, language:ca.language,`,
      `object:[(ca)-[:\`OBJECT\`]->(\`controlActionTemplate_property\`:\`Property\`) | { \`_schemaType\`:HEAD(labels(\`controlActionTemplate_property\`)), \`identifier\`:\`controlActionTemplate_property\`.\`identifier\`, \`title\`:\`controlActionTemplate_property\`.\`title\`, \`name\`:\`controlActionTemplate_property\`.\`name\`, \`description\`:\`controlActionTemplate_property\`.\`description\`, \`rangeIncludes\`:\`controlActionTemplate_property\`.\`rangeIncludes\`, \`valueRequired\`:\`controlActionTemplate_property\`.\`valueRequired\` }]`,
      `+ [(ca)-[:\`OBJECT\`]->(\`controlActionTemplate_propertyValueSpecification\`:\`PropertyValueSpecification\`) | { \`_schemaType\`:HEAD(labels(\`controlActionTemplate_propertyValueSpecification\`)), \`identifier\`:\`controlActionTemplate_propertyValueSpecification\`.\`identifier\`, \`title\`:\`controlActionTemplate_propertyValueSpecification\`.\`title\`, \`name\`:\`controlActionTemplate_propertyValueSpecification\`.\`name\`,\`valueName\`:\`controlActionTemplate_propertyValueSpecification\`.\`valueName\`, \`valueRequired\`:\`controlActionTemplate_propertyValueSpecification\`.\`valueRequired\`, \`defaultValue\`:\`controlActionTemplate_propertyValueSpecification\`.\`defaultValue\`, \`stepValue\`:\`controlActionTemplate_propertyValueSpecification\`.\`stepValue\`, \`disambiguatingDescription\`:\`controlActionTemplate_propertyValueSpecification\`.\`disambiguatingDescription\`, \`minValue\`:\`controlActionTemplate_propertyValueSpecification\`.\`maxValue\`, \`multipleValue\`:\`controlActionTemplate_propertyValueSpecification\`.\`multipleValue\`, \`readonlyValue\`:\`controlActionTemplate_propertyValueSpecification\`.\`readonlyValue\`, \`valueMaxLength\`:\`controlActionTemplate_propertyValueSpecification\`.\`valueMaxLength\`, \`valueMinLength\`:\`controlActionTemplate_propertyValueSpecification\`.\`valueMinLength\`, \`valuePattern\`:\`controlActionTemplate_propertyValueSpecification\`.\`valuePattern\`, \`valueRequired\`:\`controlActionTemplate_propertyValueSpecification\`.\`valueRequired\` }]`,
      `}} AS _payload`
    ].join(' ')
  }

  /**
   * @param template
   * @param requestInput
   * @returns {string}
   * @private
   */
  _generateCreateQuery (template, requestInput) {
    const nodeAliasesClause = (Array.isArray(requestInput.propertyObject) && requestInput.propertyObject.length > 0) ? `, ${requestInput.propertyObject.map(object => { return `\`${object.alias}\`` }).join(', ')}` : ``

    return [
      `MATCH (\`entryPoint\`:\`EntryPoint\` {\`identifier\`:"${requestInput.entryPointIdentifier}"})${this.queryHelper.generateRelationClause('EntryPoint', 'potentialAction')}(\`potentialControlAction\`:\`ControlAction\` {\`identifier\`:"${requestInput.potentialActionIdentifier}"}),`,
      this._generateMatchPropertyNodes(requestInput),
      `WITH \`entryPoint\`, \`potentialControlAction\`${nodeAliasesClause}`,
      `CREATE (\`entryPoint\`)${this.queryHelper.generateRelationClause('ControlAction', 'target', null, true)}(\`controlAction\`:\`ControlAction\` {${this._generateControlActionPropertyClause(template.potentialAction)}})-[:\`RELATED_MATCH\`]->(\`potentialControlAction\`)`,
      `WITH \`entryPoint\`, \`potentialControlAction\`, \`controlAction\`${nodeAliasesClause}`,
      this._generateCreatePropertyValuesClause(template, requestInput),
      this._generateNodeValueRelationsClause(requestInput.propertyObject),
      // `CREATE (\`propertyValue_3\`)-[:\`NODE_VALUE\`]->(\`node_1\`)`,
      `RETURN \`controlAction\` {\`_schemaType\`:HEAD(labels(\`controlAction\`)), \`identifier\`:\`controlAction\`.\`identifier\`,`,
      `\`target\`:\`entryPoint\`,`,
      `\`relatedMatch\`:\`potentialControlAction\`,`,
      `\`object\`:[\`propertyValue_1\`, \`propertyValue_2\`, \`propertyValue_3\`, \`node_1\`]`,
      `} AS _payload`
    ].join(' ')
  }

  /**
   * @param template
   * @param requestInput
   * @returns {boolean}
   * @private
   */
  _validateRequestInput (template, requestInput) {
    // debug('_validateRequestInput, template:')
    // debug(template)
    // debug('_validateRequestInput, payload:')
    // debug(payload)

    // iterate through template properties and check against payload properties
    // template.property.map(templateProperty => {
    //   debug('template property:')
    //   debug(templateProperty)
    //   if (typeof payload.propertyObject === 'undefined') {
    //     throw Error('Payload error: missing propertyObject(s)')
    //   }
    //   let valid = false
    //   payload.propertyObject.map(payloadPoperty => {
    //     if (propertyObject.potentialActionPropertyIdentifier === templateProperty.identifier) {
    //
    //     }
    //   })
    // })


    // throw Error('Payload validation error: there was a problem with the payload')
    return true
  }

  /**
   * @param template
   * @param requestInput
   * @returns {Promise<StatementResult | never>}
   * @private
   */
  _createControlAction (template, requestInput) {
    debug('template:')
    debug(template)

    debug('template.potentialAction:')
    debug(template.potentialAction)

    debug('requestInput:')
    debug(requestInput)

    const createQuery = this._generateCreateQuery(template, requestInput)
    debug('createQuery')
    debug(createQuery)

    return

    return this.session.run(createQuery)
    // retrieve ControlAction return
      .then(result => {
        const payloads = result.records.map(record => {
          return record.get('_payload')
        })

        const createdControlAction = payloads[0]
        if (typeof createdControlAction !== 'object') {
          return Promise.reject(new Error('Failed to create ControlAction'))
        }

        debug('createdControlAction:')
        debug(createdControlAction)

        return createdControlAction
      })
      .catch(function (error) {
        throw Error(error.toString())
      })
  }

  /**
   * Creates a subselection from the template (PotentialAction) properties, for the create query of a ControlAction
   * Includes a generated unique identifier property
   * @param template
   * @returns {string}
   * @private
   */
  _generateControlActionPropertyClause (template) {
    const scalarProperties = Object.keys(template)
      .filter(key => {
        // from the template, ignore non-generic properties and properties containing objects
        return (typeof template[key] !== 'object' && ['identifier', '_schemaType'].indexOf(key) === -1)
      })
      .map(key => {
        return `\`${key}\`:"${template[key]}"`
      })
      .join(', ')

    return `\`identifier\`: apoc.create.uuid(),${scalarProperties}`
  }

  /**
   * Combine template and request input to set ControlAction property values
   * @param templateProperty
   * @param requestProperty
   * @private
   */
  _composeControlActionPropertyClause (templateProperty, requestProperty) {
    let segments = [`\`identifier\`: apoc.create.uuid()`]
    segments.push(`\`propertyID\`:"${templateProperty.identifier}"`)
    segments.push(`\`description\`:"${templateProperty.description}"`)
    segments.push(`\`title\`:"${templateProperty.title}"`)
    segments.push(`\`name\`:"${templateProperty.title}"`)
    segments.push(`\`valueReference\`:"${requestProperty.nodeType}"`)

    return segments.join(', ')
  }

  _composeControlActionPropertyValueClause (templateProperty, requestPropertyValue) {
    let segments = [`\`identifier\`: apoc.create.uuid()`]
    segments.push(`\`propertyID\`:"${templateProperty.identifier}"`)
    segments.push(`\`description\`:"${templateProperty.description}"`)
    segments.push(`\`title\`:"${templateProperty.title}"`)
    segments.push(`\`name\`:"${templateProperty.valueName}"`)
    segments.push(`\`valueReference\`:"${requestPropertyValue.valuePattern}"`)
    segments.push(`\`value\`:"${requestPropertyValue.value}"`)

    return segments.join(', ')
  }

  _generateReturnPropertiesClause (alias, templateObject) {
    //let segments = [`{\`_schemaType\`:HEAD(labels(\`${alias}\`))`]

    // iterate the template object
    let segmentCounter = 1
    const segments = Object.keys(templateObject)
      // detect template properties to ignore
      .filter(key => {
        return (['identifier', '_schemaType'].indexOf(key) === -1)
      })
      .map(key => {
        // handle properties containing an object recursively
        if (typeof templateObject[key] !== 'object') {
          return false
        }
      })

    // complete the clause at front and end
    segments.unshift(`{\`_schemaType\`:HEAD(labels(\`${alias}\`))`)
    segments.push(`}`)

    return segments.join(', ')
  }

  _generateMatchPropertyNodes (requestInput) {
    if (!Array.isArray(requestInput.propertyObject) || !requestInput.propertyObject.length > 0) {
      return
    }

    return requestInput.propertyObject.map(node => {
      return `(\`${node.alias}\`:\`${node.nodeType}\` {\`identifier\`:"${node.nodeIdentifier}"})`
    }).join(', ')
  }

  /**
   * @param template
   * @param requestInput
   * @returns {string}
   * @private
   */
  _generateCreatePropertyValuesClause (template, requestInput) {
    if (Array.isArray(template.potentialAction.object) === false || template.potentialAction.object.length <= 1) {
      return ''
    }

    const objectRelationClause = this.queryHelper.generateRelationClause('ControlAction', 'object')

    const segments = template.potentialAction.object.map(templateProperty => {
      // find matching property in requestInput
      switch (templateProperty._schemaType) {
        case 'Property':
          // find matching property in requestInput
          let matchingRequestProperty = false
          requestInput.propertyObject.map(requestProperty => {
            if (requestProperty.potentialActionPropertyIdentifier === templateProperty.identifier) {
              matchingRequestProperty = requestProperty
              return true
            }
            return false
          })
          if (!matchingRequestProperty) {
            throw Error('Required node property is missing from input: ' + templateProperty.identifier + ' ' + templateProperty.title)
          }
          // compose PropertyValue clause
          return `(\`controlAction\`)${objectRelationClause}(\`${matchingRequestProperty.propertyValueAlias}\`:\`PropertyValue\` {${this._composeControlActionPropertyClause(templateProperty, matchingRequestProperty)}})`
        case 'PropertyValueSpecification':
          let matchingRequestPropertyValue = false
          requestInput.propertyValueObject.map(requestPropertyValue => {
            if (requestPropertyValue.potentialActionPropertyValueSpecificationIdentifier === templateProperty.identifier) {
              matchingRequestPropertyValue = requestPropertyValue
              return true
            }
            return false
          })
          // compose PropertyValue clause
          if (typeof matchingRequestPropertyValue === 'object') {
            // compose PropertyValue clause
            return `(\`controlAction\`)${objectRelationClause}(\`${matchingRequestPropertyValue.propertyValueAlias}\`:\`PropertyValue\` {${this._composeControlActionPropertyValueClause(templateProperty, matchingRequestPropertyValue)}})`
          }
          // throw error if this property is required
          if (templateProperty.valueRequired === true) {
            throw Error('Required value property is missing from input: ' + templateProperty.identifier + ' ' + templateProperty.title)
          }
          return
        default:
          warning('Unknown potentialAction template object encountered')
      }
    })
    if (segments.length <= 0) {
      return ''
    }

    return `CREATE ${segments.join(', ')}`
  }

  _generateNodeValueRelationsClause (requestProperties) {
    debug('requestProperties:')
    debug(requestProperties)
    if (!Array.isArray(requestProperties) || requestProperties.length <= 0) {
      return ''
    }
    // debug('requestProperties:')
    // debug(requestProperties)

    const relationClause = this.queryHelper.generateRelationClause('PropertyValue', 'nodeValue')

    let segments = requestProperties.map(requestProperty => {
      return `(\`${requestProperty.propertyValueAlias}\`)${relationClause}(\`${requestProperty.alias}\`)`
    })
    if (segments.length <= 0) {
      return ''
    }

    return `CREATE ${segments.join(', ')}`
  }

  _generateReturnClause (template) {
    let segments = [`RETURN \`controlAction\``]


    return [
      `RETURN \`controlAction\` {\`_schemaType\`:HEAD(labels(\`controlAction\`)), \`identifier\`:\`controlAction\`.\`identifier\`, \`title\`:\`controlAction\`.\`title\`,`,
      `\`target\`:{\`_schemaType\`:HEAD(labels(\`entryPoint\`)), \`identifier\`:\`entryPoint\`.\`identifier\`, \`title\`:\`entryPoint\`.\`title\`},`,
      `\`object\`:[`,
      `{\`_schemaType\`:HEAD(labels(\`propertyValueSpecification_1\`)), \`identifier\`:\`propertyValueSpecification_1\`.identifier},`,
      `{\`_schemaType\`:HEAD(labels(\`property_1\`)), \`identifier\`:\`property_1\`.identifier}`,
      `]} AS _payLoad`
    ].join(' ')
  }
}

export default RequestControlActionCommand
