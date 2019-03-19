import { debug, info, warning } from '../index'
import QueryHelper from '../helpers/SchemaHelper'
import { driver } from '../driver'
import { pubsub } from "../resolvers";

class RequestControlActionCommand {
  constructor (params) {
    this.params = params
    // this.driver = driver
    this.session = driver.session()

    // this.schemaHelper = new SchemaHelper(resolveInfo.schema)
    this.queryHelper = new QueryHelper()
  }

  get create () {
    const payload = this._retrievePayload()
    // const potentialActionIdentifier = payload.potentialActionIdentifier
    const potentialActionQuery = this._generateTemplateQuery(payload)
    debug(potentialActionQuery)

    return this.session.run(potentialActionQuery)
      // retrieve template ControlAction
      .then(result => {
        debug('retrieve template ControlAction:')
        return result.records.map(record => {
          let templateResult = result.records.map(record => {
            return record.get('_payload')
          })
          const template = templateResult[0]
          if (typeof template.identifier !== 'string' || template.identifier !== payload.potentialActionIdentifier) {
            throw Error(`potentialAction with identifier ${payload.potentialActionIdentifier} not found`)
          }

          return template
        })
      })
      // validate payload against template
      .then(template => {
        debug('validate payload against template:')
        debug(template)
        this._validatePayload(template, payload)
        return template
      })
      // create ControlAction
      .then(template => {
        debug('create ControlAction:')
        debug(payload)
        return this._createControlAction(template, payload)
      })
      .catch(function (error) {
        throw Error(error.toString())
      })
  }

  _retrievePayload () {
    const payload = this.params.controlAction
    if (typeof payload !== 'object' || typeof payload.entryPointIdentifier !== 'string' || typeof payload.potentialActionIdentifier !== 'string') {
      throw Error('Payload error: either empty or missing `entryPointIdentifier` or `potentialActionIdentifier` parameter')
    }

    return payload
  }

  _generateTemplateQuery (payload) {
    return [
      `MATCH (\`controlActionTemplate\`:\`ControlAction\` {\`identifier\`:"${payload.potentialActionIdentifier}"})<-[\`potentialAction\`:\`POTENTIAL_ACTION\`]-(\`entryPoint\`:\`EntryPoint\` {\`identifier\`:"${payload.entryPointIdentifier}"})`,
      `WITH \`controlActionTemplate\``,
      `RETURN \`controlActionTemplate\``,
      `{\`identifier\`:\`controlActionTemplate\`.\`identifier\`, \`name\`:\`controlActionTemplate\`.\`name\`,`,
      `\`property\`:[(\`controlActionTemplate\`)-[:\`OBJECT\`]->(\`controlActionTemplate_property\`:\`Property\`) | { \`_schemaType\`:HEAD(labels(\`controlActionTemplate_property\`)), \`identifier\`:\`controlActionTemplate_property\`.\`identifier\`, \`title\`:\`controlActionTemplate_property\`.\`title\`, \`description\`:\`controlActionTemplate_property\`.\`description\`, \`rangeIncludes\`:\`controlActionTemplate_property\`.\`rangeIncludes\` }] + [(\`controlActionTemplate\`)-[:\`OBJECT\`]->(\`controlActionTemplate_propertyValueSpecification\`:\`PropertyValueSpecification\`) | { \`_schemaType\`:HEAD(labels(\`controlActionTemplate_propertyValueSpecification\`)), \`identifier\`:\`controlActionTemplate_propertyValueSpecification\`.\`identifier\`, \`title\`:\`controlActionTemplate_propertyValueSpecification\`.\`title\`, \`name\`:\`controlActionTemplate_propertyValueSpecification\`.\`name\`,\`valueName\`:\`controlActionTemplate_propertyValueSpecification\`.\`valueName\`, \`valueRequired\`:\`controlActionTemplate_propertyValueSpecification\`.\`valueRequired\`, \`defaultValue\`:\`controlActionTemplate_propertyValueSpecification\`.\`defaultValue\`, \`stepValue\`:\`controlActionTemplate_propertyValueSpecification\`.\`stepValue\`, \`disambiguatingDescription\`:\`controlActionTemplate_propertyValueSpecification\`.\`disambiguatingDescription\`, \`minValue\`:\`controlActionTemplate_propertyValueSpecification\`.\`maxValue\`, \`multipleValue\`:\`controlActionTemplate_propertyValueSpecification\`.\`multipleValue\`, \`readonlyValue\`:\`controlActionTemplate_propertyValueSpecification\`.\`readonlyValue\`, \`valueMaxLength\`:\`controlActionTemplate_propertyValueSpecification\`.\`valueMaxLength\`, \`valueMinLength\`:\`controlActionTemplate_propertyValueSpecification\`.\`valueMinLength\`, \`valuePattern\`:\`controlActionTemplate_propertyValueSpecification\`.\`valuePattern\`, \`valueRequired\`:\`controlActionTemplate_propertyValueSpecification\`.\`valueRequired\` }]}`,
      `AS _payload`
      ].join(' ')


    // return `MATCH (templateControlAction:ControlAction {identifier:"${identifier}"})-[r:OBJECT]->(properties) RETURN templateControlAction, properties`
    // return `MATCH (pa:${type} {identifier:"${identifier}"}) RETURN pa AS _payload`
  }

  _generateCreateControlActionQuery (template, payload) {

  }

  _validatePayload (template, payload) {
    debug('_validatePayload')
    // throw Error('Payload validation error: there was a problem with the payload')
    return true
  }

  _createControlAction (template, payload) {
    debug('_createControlAction')
    //const createControlActionQuery = this._generateCreateControlActionQuery(template, payload)
    return { 'ok': true }
  }
}

export default RequestControlActionCommand
