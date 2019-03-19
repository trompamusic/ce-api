import { debug, info, warning } from '../index'
// import StringHelper from '../helpers/StringHelper'
// import SchemaHelper from '../helpers/SchemaHelper'
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
    const potentialActionIdentifier = payload.potentialActionIdentifier
    const potentialActionQuery = this._generateTemplateQuery(potentialActionIdentifier)
    //this._getSession()
    debug(potentialActionQuery)
    // retrieve template ControlAction
    return this.session.run(potentialActionQuery)
      .then(result => {
        // let template = {}
        result.records.map(record => {
          let templateResult = result.records.map(record => {
            return record.get('_payload')
          })
          const template = templateResult[0]
          if (typeof template.identifier !== 'string' || template.identifier !== potentialActionIdentifier) {
            throw Error(`potentialAction with identifier ${potentialActionIdentifier} not found`)
          }
          debug('template:')
          debug(template)

          // validate payload against template specifications
          this._validatePayload(template, payload)

          // create new ControlAction
          const controlAction = this._createControlAction(template, payload)

          return controlAction
        })
      })
      .catch(function (error) {
        throw Error(error.toString())
      })

    // return promise
    //
    // debug(this.session)
    // //debug(payload)

  }

  _retrievePayload () {
    const payload = this.params.controlAction
    if (typeof payload !== 'object' || typeof payload.potentialActionIdentifier !== 'string') {
      throw Error('Payload error: either empty or missing `potentialActionIdentifier` parameter')
    }

    return payload
  }

  _generateTemplateQuery (identifier) {
    return [
      `MATCH (\`controlActionTemplate\`:\`ControlAction\` {\`identifier\`:"${identifier}"})`,
      `WITH \`controlActionTemplate\``,
      `RETURN \`controlActionTemplate\``,
      `{\`identifier\`:\`controlActionTemplate\`.\`identifier\`, \`name\`:\`controlActionTemplate\`.\`name\`,`,
      `\`property\`:[(\`controlActionTemplate\`)-[:\`OBJECT\`]->(\`controlActionTemplate_property\`:\`Property\`) | { \`_schemaType\`:HEAD(labels(\`controlActionTemplate_property\`)), \`identifier\`:\`controlActionTemplate_property\`.\`identifier\`, \`title\`:\`controlActionTemplate_property\`.\`title\`, \`description\`:\`controlActionTemplate_property\`.\`description\`, \`rangeIncludes\`:\`controlActionTemplate_property\`.\`rangeIncludes\` }] + [(\`controlActionTemplate\`)-[:\`OBJECT\`]->(\`controlActionTemplate_propertyValueSpecification\`:\`PropertyValueSpecification\`) | { \`_schemaType\`:HEAD(labels(\`controlActionTemplate_propertyValueSpecification\`)), \`identifier\`:\`controlActionTemplate_propertyValueSpecification\`.\`identifier\`, \`title\`:\`controlActionTemplate_propertyValueSpecification\`.\`title\`, \`name\`:\`controlActionTemplate_propertyValueSpecification\`.\`name\`,\`valueName\`:\`controlActionTemplate_propertyValueSpecification\`.\`valueName\`, \`valueRequired\`:\`controlActionTemplate_propertyValueSpecification\`.\`valueRequired\`, \`defaultValue\`:\`controlActionTemplate_propertyValueSpecification\`.\`defaultValue\`, \`stepValue\`:\`controlActionTemplate_propertyValueSpecification\`.\`stepValue\`, \`disambiguatingDescription\`:\`controlActionTemplate_propertyValueSpecification\`.\`disambiguatingDescription\`, \`minValue\`:\`controlActionTemplate_propertyValueSpecification\`.\`maxValue\`, \`multipleValue\`:\`controlActionTemplate_propertyValueSpecification\`.\`multipleValue\`, \`readonlyValue\`:\`controlActionTemplate_propertyValueSpecification\`.\`readonlyValue\`, \`valueMaxLength\`:\`controlActionTemplate_propertyValueSpecification\`.\`valueMaxLength\`, \`valueMinLength\`:\`controlActionTemplate_propertyValueSpecification\`.\`valueMinLength\`, \`valuePattern\`:\`controlActionTemplate_propertyValueSpecification\`.\`valuePattern\`, \`valueRequired\`:\`controlActionTemplate_propertyValueSpecification\`.\`valueRequired\` }]}`,
      `AS _payload`
      ].join(' ')


    // return `MATCH (templateControlAction:ControlAction {identifier:"${identifier}"})-[r:OBJECT]->(properties) RETURN templateControlAction, properties`
    // return `MATCH (pa:${type} {identifier:"${identifier}"}) RETURN pa AS _payload`
  }

  _validatePayload (template, payload) {
    debug('_validatePayload')
    return true
  }

  _createControlAction (template, payload) {
    debug('_createControlAction')
  }
}

export default RequestControlActionCommand
