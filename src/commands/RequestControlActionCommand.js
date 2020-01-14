import { info, warning } from '../utils/logger'
import QueryHelper from '../helpers/QueryHelper'
import { driver } from '../driver'
import { pubsub } from '../resolvers'

class RequestControlActionCommand {
  /**
   * @param params
   * @param resolveInfo
   */
  constructor (params, resolveInfo) {
    this.params = params
    this.resolveInfo = resolveInfo
    this.session = driver.session()
    this.queryHelper = new QueryHelper()
  }

  /**
   * @returns {Promise<StatementResult | never>}
   */
  get create () {
    const requestInput = this._retrieveRequestInput()
    const entryPointQuery = this._generateTemplateQuery(requestInput)
    info(entryPointQuery)
    return this.session.run(entryPointQuery)
      // retrieve template ControlAction
      .then(result => {
        const payloads = result.records.map(record => {
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

    let nodeCounter = 1
    // hydrate propertyObject aliases
    if (Array.isArray(requestInput.propertyObject)) {
      requestInput.propertyObject = requestInput.propertyObject.map(node => {
        node.alias = `node_${nodeCounter}`
        node.propertyValueAlias = `propertyValue_${nodeCounter}`
        nodeCounter++

        return node
      })
    }
    // hydrate propertyValueObject aliases
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
      `RETURN ep {${QueryHelper.schemaTypeClause('ep')}, identifier:ep.identifier, name:ep.name, contributor:ep.contributor, title:ep.title, creator:ep.creator, source:ep.source, subject:ep.subject, format:ep.format, language:ep.language,`,
      `actionApplication:sa,`,
      `potentialAction:{${QueryHelper.schemaTypeClause('ca')}, identifier:ca.identifier, name:ca.name, contributor:ca.contributor, title:ca.title, description:ca.description, creator:ca.creator, source:ca.source, subject:ca.subject, format:ca.format, language:ca.language, actionStatus:ca.actionStatus,`,
      `object:[(ca)-[:\`OBJECT\`]->(\`controlActionTemplate_property\`:\`Property\`) | { ${QueryHelper.schemaTypeClause('controlActionTemplate_property')}, \`identifier\`:\`controlActionTemplate_property\`.\`identifier\`, \`title\`:\`controlActionTemplate_property\`.\`title\`, \`name\`:\`controlActionTemplate_property\`.\`name\`, \`description\`:\`controlActionTemplate_property\`.\`description\`, \`rangeIncludes\`:\`controlActionTemplate_property\`.\`rangeIncludes\`, \`valueRequired\`:\`controlActionTemplate_property\`.\`valueRequired\` }]`,
      `+ [(ca)-[:\`OBJECT\`]->(\`controlActionTemplate_propertyValueSpecification\`:\`PropertyValueSpecification\`) | { ${QueryHelper.schemaTypeClause('controlActionTemplate_propertyValueSpecification')}, \`identifier\`:\`controlActionTemplate_propertyValueSpecification\`.\`identifier\`, \`title\`:\`controlActionTemplate_propertyValueSpecification\`.\`title\`, \`name\`:\`controlActionTemplate_propertyValueSpecification\`.\`name\`,\`valueName\`:\`controlActionTemplate_propertyValueSpecification\`.\`valueName\`, \`valueRequired\`:\`controlActionTemplate_propertyValueSpecification\`.\`valueRequired\`, \`defaultValue\`:\`controlActionTemplate_propertyValueSpecification\`.\`defaultValue\`, \`stepValue\`:\`controlActionTemplate_propertyValueSpecification\`.\`stepValue\`, \`disambiguatingDescription\`:\`controlActionTemplate_propertyValueSpecification\`.\`disambiguatingDescription\`, \`minValue\`:\`controlActionTemplate_propertyValueSpecification\`.\`maxValue\`, \`multipleValue\`:\`controlActionTemplate_propertyValueSpecification\`.\`multipleValue\`, \`readonlyValue\`:\`controlActionTemplate_propertyValueSpecification\`.\`readonlyValue\`, \`valueMaxLength\`:\`controlActionTemplate_propertyValueSpecification\`.\`valueMaxLength\`, \`valueMinLength\`:\`controlActionTemplate_propertyValueSpecification\`.\`valueMinLength\`, \`valuePattern\`:\`controlActionTemplate_propertyValueSpecification\`.\`valuePattern\`, \`valueRequired\`:\`controlActionTemplate_propertyValueSpecification\`.\`valueRequired\` }]`,
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
    const propertySelections = this._generateMatchPropertyNodes(requestInput)

    return [
      `MATCH (\`entryPoint\`:\`EntryPoint\` {\`identifier\`:"${requestInput.entryPointIdentifier}"})${this.queryHelper.generateRelationClause('EntryPoint', 'potentialAction')}(\`potentialControlAction\`:\`ControlAction\` {\`identifier\`:"${requestInput.potentialActionIdentifier}"})`,
      propertySelections ? `, ${propertySelections}` : '',
      `WITH \`entryPoint\`, \`potentialControlAction\`${nodeAliasesClause}`,
      `CREATE (\`entryPoint\`)${this.queryHelper.generateRelationClause('ControlAction', 'target', null, true)}(\`controlAction\`:\`ControlAction\` {${this._generateControlActionPropertyClause(template.potentialAction)}})${this.queryHelper.generateRelationClause('ControlAction', 'wasDerivedFrom')}(\`potentialControlAction\`)`,
      `WITH \`entryPoint\`, \`potentialControlAction\`, \`controlAction\`${nodeAliasesClause}`,
      this._generateCreatePropertyValuesClause(template, requestInput),
      this._generateNodeValueRelationsClause(requestInput.propertyObject),
      this._generateReturnClause(template, requestInput)
    ].filter(line => typeof line === 'string' && line.length > 0).join(' ')
  }

  /**
   * @param template
   * @param requestInput
   * @returns {boolean}
   * @private
   */
  _validateRequestInput (template, requestInput) {
    // check request propertyObjects against template properties
    let requestPropertyValidity = (requestInput.propertyObject || []).map(requestProperty => {
      return template.potentialAction.object.some(templateProperty => {
        if (
          templateProperty._schemaType === 'Property' && requestProperty.potentialActionPropertyIdentifier === templateProperty.identifier
        ) {
          return true
        }
      })
    })

    if (requestPropertyValidity.includes(false)) {
      throw Error('Request error: one or more passed propertyObjects do not match potential action properties')
    }

    // check request propertyObjects against template properties
    let requestPropertyValueValidity = (requestInput.propertyValueObject || []).map(requestProperty => {
      return template.potentialAction.object.some(templateProperty => {
        if (templateProperty._schemaType === 'PropertyValueSpecification' && requestProperty.potentialActionPropertyValueSpecificationIdentifier === templateProperty.identifier) {
          return true
        }
      })
    })

    if (requestPropertyValueValidity.includes(false)) {
      throw Error('Request error: one or more passed propertyValueObjects do not match potential action properties')
    }

    return true
  }

  /**
   * @param template
   * @param requestInput
   * @returns {Promise<StatementResult | never>}
   * @private
   */
  _createControlAction (template, requestInput) {
    const createQuery = this._generateCreateQuery(template, requestInput)
    info(createQuery)

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
        // createdControlAction.entryPointIdentifier = template.identifier
        pubsub.publish('ControlActionRequest', { ControlActionRequest: createdControlAction, entryPointIdentifier: template.identifier })

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
    const potentialActionProps = (this.params.controlAction && this.params.controlAction.potentialAction) || {}
    const scalarProperties = Object.keys(template)
      .filter(key => {
        // from the template, ignore non-generic properties and properties containing objects
        return (typeof template[key] !== 'object' && !['identifier', '_schemaType'].includes(key))
      })
      .map(key => {
        if (key === 'actionStatus') {
          return `\`${key}\`:"PotentialActionStatus"`
        }

        return `\`${key}\`:"${potentialActionProps[key] || template[key]}"`
      })
      .join(', ')

    return `\`identifier\`: apoc.create.uuid(),${scalarProperties}`
  }

  /**
   * Assemble a PropertyValue for a Property (relation to node) by combining template and request-input data
   * @param templateProperty
   * @param requestProperty
   * @returns {string}
   * @private
   */
  _composeControlActionPropertyClause (templateProperty, requestProperty) {
    let segments = [
      `\`identifier\`: apoc.create.uuid()`,
      `\`propertyID\`:"${templateProperty.identifier}"`,
      `\`description\`:"${templateProperty.description}"`,
      `\`title\`:"${templateProperty.title}"`,
      `\`name\`:"${templateProperty.title}"`,
      `\`valueReference\`:"${requestProperty.nodeType}"`
    ]

    return segments.join(', ')
  }

  /**
   * Assemble a PropertyValue by combining template and request-input data
   * @param templateProperty
   * @param requestPropertyValue
   * @returns {string}
   * @private
   */
  _composeControlActionPropertyValueClause (templateProperty, requestPropertyValue) {
    let segments = [
      `\`identifier\`: apoc.create.uuid()`,
      `\`propertyID\`:"${templateProperty.identifier}"`,
      `\`description\`:"${templateProperty.description}"`,
      `\`title\`:"${templateProperty.title}"`,
      `\`name\`:"${templateProperty.valueName}"`,
      `\`valueReference\`:"${requestPropertyValue.valuePattern}"`,
      `\`value\`:"${requestPropertyValue.value}"`
    ]

    return segments.join(', ')
  }

  /**
   * @param requestInput
   * @returns {string}
   * @private
   */
  _generateMatchPropertyNodes (requestInput) {
    if (!Array.isArray(requestInput.propertyObject) || !requestInput.propertyObject.length > 0) {
      return ''
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

  /**
   * @param requestProperties
   * @returns {string}
   * @private
   */
  _generateNodeValueRelationsClause (requestProperties) {
    if (!Array.isArray(requestProperties) || requestProperties.length <= 0) {
      return ''
    }

    let segments = requestProperties.map(requestProperty => {
      return `(\`${requestProperty.propertyValueAlias}\`)${this.queryHelper.generateRelationClause('PropertyValue', 'nodeValue')}(\`${requestProperty.alias}\`)`
    })

    return `CREATE ${segments.join(', ')}`
  }

  /**
   * @param template
   * @param requestInput
   * @returns {string}
   * @private
   */
  _generateReturnClause (template, requestInput) {
    let segments = [
      `RETURN \`controlAction\` {`,
      this.queryHelper.selectedPropertiesClause('ControlAction', 'controlAction', this.resolveInfo.fieldNodes[0].selectionSet),
      `} AS _payload`
    ]

    return segments.join(' ')
  }
}

export default RequestControlActionCommand
