import { UserInputError } from 'apollo-server'
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
          throw new UserInputError('Template EntryPoint/ControlAction was not found')
        }

        return template
      })
      // validate request payload against template and create requested ControlAction
      .then(template => {
        this._validateRequestInput(template, requestInput)

        return this._createControlAction(template, requestInput)
      })
  }

  /**
   * @returns {Object}
   * @private
   */
  _retrieveRequestInput () {
    const requestInput = this.params.controlAction
    if (typeof requestInput !== 'object' || typeof requestInput.entryPointIdentifier !== 'string' || typeof requestInput.potentialActionIdentifier !== 'string') {
      throw new UserInputError('Request Input error: either empty or missing `entryPointIdentifier` or `potentialActionIdentifier` parameter')
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
      `potentialAction:{${QueryHelper.schemaTypeClause('ca')}, identifier:ca.identifier, name:ca.name, contributor:ca.contributor, title:ca.title, description:ca.description, creator:ca.creator, source:ca.source, subject:ca.subject, format:ca.format, language:ca.language, actionStatus:ca.actionStatus, url:ca.url,`,
      `object:[(ca)-[:\`OBJECT\`]->(\`controlActionTemplate_property\`:\`Property\`) | { ${QueryHelper.schemaTypeClause('controlActionTemplate_property', ['Property'])}, \`identifier\`:\`controlActionTemplate_property\`.\`identifier\`, \`title\`:\`controlActionTemplate_property\`.\`title\`, \`name\`:\`controlActionTemplate_property\`.\`name\`, \`description\`:\`controlActionTemplate_property\`.\`description\`, \`rangeIncludes\`:\`controlActionTemplate_property\`.\`rangeIncludes\`, \`valueRequired\`:\`controlActionTemplate_property\`.\`valueRequired\` }]`,
      `+ [(ca)-[:\`OBJECT\`]->(\`controlActionTemplate_propertyValueSpecification\`:\`PropertyValueSpecification\`) | { ${QueryHelper.schemaTypeClause('controlActionTemplate_propertyValueSpecification', ['PropertyValueSpecification'])}, \`identifier\`:\`controlActionTemplate_propertyValueSpecification\`.\`identifier\`, \`title\`:\`controlActionTemplate_propertyValueSpecification\`.\`title\`, \`name\`:\`controlActionTemplate_propertyValueSpecification\`.\`name\`,\`valueName\`:\`controlActionTemplate_propertyValueSpecification\`.\`valueName\`, \`valueRequired\`:\`controlActionTemplate_propertyValueSpecification\`.\`valueRequired\`, \`defaultValue\`:\`controlActionTemplate_propertyValueSpecification\`.\`defaultValue\`, \`stepValue\`:\`controlActionTemplate_propertyValueSpecification\`.\`stepValue\`, \`disambiguatingDescription\`:\`controlActionTemplate_propertyValueSpecification\`.\`disambiguatingDescription\`, \`minValue\`:\`controlActionTemplate_propertyValueSpecification\`.\`maxValue\`, \`multipleValue\`:\`controlActionTemplate_propertyValueSpecification\`.\`multipleValue\`, \`readonlyValue\`:\`controlActionTemplate_propertyValueSpecification\`.\`readonlyValue\`, \`valueMaxLength\`:\`controlActionTemplate_propertyValueSpecification\`.\`valueMaxLength\`, \`valueMinLength\`:\`controlActionTemplate_propertyValueSpecification\`.\`valueMinLength\`, \`valuePattern\`:\`controlActionTemplate_propertyValueSpecification\`.\`valuePattern\`, \`valueRequired\`:\`controlActionTemplate_propertyValueSpecification\`.\`valueRequired\` }]`,
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
    const nodeAliasesClause = (Array.isArray(requestInput.propertyObject) && requestInput.propertyObject.length > 0) ? `, ${requestInput.propertyObject.map(object => {
      return `\`${object.alias}\``
    }).join(', ')}` : ``
    const propertySelections = this._generateMatchPropertyNodes(requestInput)

    return [
      `MATCH (\`entryPoint\`:\`EntryPoint\` {\`identifier\`:"${requestInput.entryPointIdentifier}"})${this.queryHelper.generateRelationClause('EntryPoint', 'potentialAction')}(\`potentialControlAction\`:\`ControlAction\` {\`identifier\`:"${requestInput.potentialActionIdentifier}"})`,
      propertySelections ? `, ${propertySelections}` : '',
      `WITH \`entryPoint\`, \`potentialControlAction\`${nodeAliasesClause}`,
      `LIMIT 1`,
      `CREATE (\`entryPoint\`)${this.queryHelper.generateRelationClause('ControlAction', 'target', null, true)}(\`controlAction\`:\`ControlAction\`:\`ActionInterface\`:\`ProvenanceActivityInterface\`:\`ProvenanceEntityInterface\`:\`ThingInterface\` {${this._generateControlActionPropertyClause(template.potentialAction)}})${this.queryHelper.generateRelationClause('ControlAction', 'wasDerivedFrom')}(\`potentialControlAction\`)`,
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
      throw new UserInputError('Request error: one or more passed propertyObjects do not match potential action properties')
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
      throw new UserInputError('Request error: one or more passed propertyValueObjects do not match potential action properties')
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
        pubsub.publish('ControlActionRequest', {
          ControlActionRequest: createdControlAction,
          entryPointIdentifier: template.identifier
        })
        pubsub.publish('ThingCreateMutation', { identifier: createdControlAction.identifier, type: 'ControlAction' })

        return createdControlAction
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
    const properties = { ...template, ...potentialActionProps, actionStatus: 'PotentialActionStatus' }
    const scalarProperties = Object.keys(properties)
      .filter(key => {
        // from the template, ignore non-generic properties and properties containing objects
        return (typeof properties[key] !== 'object' && !['identifier', '_schemaType'].includes(key))
      })
      .map(key => {
        if (key === 'endTime') {
          return `\`${key}\`: datetime("${potentialActionProps[key] || properties[key]}")`
        }

        return `\`${key}\`:"${potentialActionProps[key] || properties[key]}"`
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
      `\`name\`:"${templateProperty.name}"`,
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
    if (!Array.isArray(template.potentialAction.object)) {
      return ''
    }

    const objectRelationClause = this.queryHelper.generateRelationClause('ControlAction', 'object')

    const segments = template.potentialAction.object.map(templateProperty => {
      // find matching property in requestInput
      switch (templateProperty._schemaType) {
        case 'Property':
          // find matching property in requestInput
          const matchingRequestProperty = requestInput.propertyObject.find(requestProperty => {
            return requestProperty.potentialActionPropertyIdentifier === templateProperty.identifier
          })

          if (!matchingRequestProperty) {
            throw new UserInputError('Required node property is missing from input: ' + templateProperty.identifier + ' ' + templateProperty.title)
          }
          // compose PropertyValue clause
          return `(\`controlAction\`)${objectRelationClause}(\`${matchingRequestProperty.propertyValueAlias}\`:\`PropertyValue\`:\`ThingInterface\` {${this._composeControlActionPropertyClause(templateProperty, matchingRequestProperty)}})`
        case 'PropertyValueSpecification':
          const matchingRequestPropertyValue = requestInput.propertyValueObject.find(requestPropertyValue => {
            return requestPropertyValue.potentialActionPropertyValueSpecificationIdentifier === templateProperty.identifier
          })

          // compose PropertyValue clause
          if (typeof matchingRequestPropertyValue === 'object') {
            const valuesClause = this._composeControlActionPropertyValueClause(templateProperty, matchingRequestPropertyValue)

            // compose PropertyValue clause
            return `(\`controlAction\`)${objectRelationClause}(\`${matchingRequestPropertyValue.propertyValueAlias}\`:\`PropertyValue\`:\`ThingInterface\` {${valuesClause}})`
          }

          // use the default value if given in the template PropertyValue
          if (typeof templateProperty.defaultValue !== 'undefined' && templateProperty.defaultValue !== null) {
            const valuesClause = this._composeControlActionPropertyValueClause(templateProperty, {
              value: templateProperty.defaultValue,
              valuePattern: templateProperty.valuePattern
            })

            // use a random PropertyValue alias, we are not referring to it
            return `(\`controlAction\`)${objectRelationClause}(\`propertyValue_${Math.round(Math.random() * 100)}\`:\`PropertyValue\`:\`ThingInterface\` {${valuesClause}})`
          }

          // throw error if this property is required
          if (templateProperty.valueRequired === true) {
            throw new UserInputError('Required value property is missing from input: ' + templateProperty.identifier + ' ' + templateProperty.title)
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
