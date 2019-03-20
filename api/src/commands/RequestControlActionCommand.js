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
    const potentialActionQuery = this._generateTemplateQuery(requestInput)

    return this.session.run(potentialActionQuery)
      // retrieve template ControlAction
      .then(result => {
        const payloads = result.records.map(record => {
          return record.get('_payload')
        })

        const template = payloads[0]
        if (typeof template !== 'object' || typeof template.identifier !== 'string' || template.identifier !== requestInput.potentialActionIdentifier) {
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

    return requestInput
  }

  /**
   * @param requestInput
   * @returns {string}
   * @private
   */
  _generateTemplateQuery (requestInput) {
    return [
      `MATCH (\`controlActionTemplate\`:\`ControlAction\` {\`identifier\`:"${requestInput.potentialActionIdentifier}"})<-[\`potentialAction\`:\`POTENTIAL_ACTION\`]-(\`entryPoint\`:\`EntryPoint\` {\`identifier\`:"${requestInput.entryPointIdentifier}"})`,
      `WITH \`controlActionTemplate\``,
      `RETURN \`controlActionTemplate\``,
      `{\`identifier\`:\`controlActionTemplate\`.\`identifier\`, \`name\`:\`controlActionTemplate\`.\`name\`, \`description\`:\`controlActionTemplate\`.\`description\`,`,
      `\`object\`:[(\`controlActionTemplate\`)-[:\`OBJECT\`]->(\`controlActionTemplate_property\`:\`Property\`) | { \`_schemaType\`:HEAD(labels(\`controlActionTemplate_property\`)), \`identifier\`:\`controlActionTemplate_property\`.\`identifier\`, \`title\`:\`controlActionTemplate_property\`.\`title\`, \`description\`:\`controlActionTemplate_property\`.\`description\`, \`rangeIncludes\`:\`controlActionTemplate_property\`.\`rangeIncludes\` }]`,
      `+ [(\`controlActionTemplate\`)-[:\`OBJECT\`]->(\`controlActionTemplate_propertyValueSpecification\`:\`PropertyValueSpecification\`) | { \`_schemaType\`:HEAD(labels(\`controlActionTemplate_propertyValueSpecification\`)), \`identifier\`:\`controlActionTemplate_propertyValueSpecification\`.\`identifier\`, \`title\`:\`controlActionTemplate_propertyValueSpecification\`.\`title\`, \`name\`:\`controlActionTemplate_propertyValueSpecification\`.\`name\`,\`valueName\`:\`controlActionTemplate_propertyValueSpecification\`.\`valueName\`, \`valueRequired\`:\`controlActionTemplate_propertyValueSpecification\`.\`valueRequired\`, \`defaultValue\`:\`controlActionTemplate_propertyValueSpecification\`.\`defaultValue\`, \`stepValue\`:\`controlActionTemplate_propertyValueSpecification\`.\`stepValue\`, \`disambiguatingDescription\`:\`controlActionTemplate_propertyValueSpecification\`.\`disambiguatingDescription\`, \`minValue\`:\`controlActionTemplate_propertyValueSpecification\`.\`maxValue\`, \`multipleValue\`:\`controlActionTemplate_propertyValueSpecification\`.\`multipleValue\`, \`readonlyValue\`:\`controlActionTemplate_propertyValueSpecification\`.\`readonlyValue\`, \`valueMaxLength\`:\`controlActionTemplate_propertyValueSpecification\`.\`valueMaxLength\`, \`valueMinLength\`:\`controlActionTemplate_propertyValueSpecification\`.\`valueMinLength\`, \`valuePattern\`:\`controlActionTemplate_propertyValueSpecification\`.\`valuePattern\`, \`valueRequired\`:\`controlActionTemplate_propertyValueSpecification\`.\`valueRequired\` }]}`,
      `AS _payload`
    ].join(' ')
  }

  /**
   * @param template
   * @param requestInput
   * @returns {string}
   * @private
   */
  _generateCreateQuery (template, requestInput) {
    const targetRelationClause = QueryHelper.relationClause(
      SchemaHelper.retrievePropertyTypeRelationDetails(
        this.schemaHelper.findPropertyType('ControlAction', 'target')
      )
    )

    // const controlActionProperties =

    // debug('relationDetails')
    // debug(relationDetails)

    return [
      `MATCH (\`entryPoint\` {identifier: "${requestInput.entryPointIdentifier}"})`,
      `WITH \`entryPoint\``,
      `CREATE (\`controlAction\`:\`ControlAction\` ${this._generateControlActionPropertyClause(template)})${targetRelationClause}(\`entryPoint\`)`,
      `WITH \`entryPoint\`, \`controlAction\``,
      this._generateCreatePropertiesClause(template.object, requestInput),
      `RETURN \`controlAction\` {${QueryHelper.schemaTypeClause('controlAction')}, \`identifier\`:\`controlAction\`.\`identifier\`, \`title\`:\`controlAction\`.\`title\`, \`target\`:{${QueryHelper.schemaTypeClause('entryPoint')}, \`identifier\`:\`entryPoint\`.\`identifier\`, \`title\`:\`entryPoint\`.\`title\`}} AS _payLoad`
    ].join(' ')

    // MATCH (`entryPoint` {identifier: "8b621203-0824-4b72-9015-3311bd11197d"})
    // WITH `entryPoint`
    // CREATE (`entryPoint`)<-[:`TARGET`]-(`controlAction`:`ControlAction` {`identifier`: apoc.create.uuid(), `title`:`entryPoint`.`title`})
    // WITH `entryPoint`, `controlAction`
    // CREATE (`controlAction`)-[:OBJECT]->(`propertyValueSpecification_1`:`PropertyValueSpecification` {`identifier`: apoc.create.uuid(), `title`:"Volume", `valueName`:"volume", `valueRequired`:false, `description`:"This is a numeric value that should be between 0 and 10", `defaultValue`:5, `disambiguatingDescription`:"Int"}),
    // (`controlAction`)-[:OBJECT]->(`property_1`:`Property` {`identifier`: apoc.create.uuid(), `title`:"A music recording", `description`:"This should be an existing TROMPA reference of a VideoObject or AudioObject type", `rangeIncludes`:["AudioObject","VideoObject"]})
    // RETURN `controlAction` {`_schemaType`:HEAD(labels(`controlAction`)), `identifier`:`controlAction`.`identifier`, `title`:`controlAction`.`title`,
    //   `target`:{`_schemaType`:HEAD(labels(`entryPoint`)), `identifier`:`entryPoint`.`identifier`, `title`:`entryPoint`.`title`},
    //   `object`:[
    //     {`_schemaType`:HEAD(labels(`propertyValueSpecification_1`)), `identifier`:`propertyValueSpecification_1`.identifier},
    //   {`_schemaType`:HEAD(labels(`property_1`)), `identifier`:`property_1`.identifier}
    // ]} AS _payLoad
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
   * @param payload
   * @returns {Promise<StatementResult | never>}
   * @private
   */
  _createControlAction (template, requestInput) {
    debug('template:')
    debug(template)
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
   * @param payload
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

    return `{\`identifier\`: apoc.create.uuid(),${scalarProperties}}`
  }

  _generateCreatePropertiesClause (templateObject, requestInput) {
    // generate relation clause for ControlAction.object
    const objectRelationClause = QueryHelper.relationClause(
      SchemaHelper.retrievePropertyTypeRelationDetails(
        this.schemaHelper.findPropertyType('ControlAction', 'object')
      )
    )

    let propertyCounter = 1
    let segments = templateObject.map(templateProperty => {
      const alias = `${StringHelper.lowercaseFirstCharacter(templateProperty._schemaType)}_${propertyCounter}`
      return `(\`controlAction\`)${objectRelationClause}(\`${alias}\`:\`${templateProperty._schemaType}\` {${this._generateControlActionPropertyClause(templateProperty)})`
    })

    if (segments.length > 0) {
      segments.unshift(`CREATE`)
    }

    return segments.join(', ')
  }
}

export default RequestControlActionCommand
