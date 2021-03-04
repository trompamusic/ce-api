import RequestControlActionCommand from './RequestControlActionCommand'
import { UserInputError } from 'apollo-server'

const mockSelectionSet = [{
  kind: 'Field',
  alias: undefined,
  name: [{ type: 'Name', value: 'identifier' }],
  arguments: [],
  directives: [],
  selectionSet: undefined,
  loc: []
}]

const mockParamsValid = require('./fixtures/request_params_valid.json')
const mockParamsMissingRequired = require('./fixtures/request_params_missing_required.json')
const mockTemplate = require('./fixtures/template.json')

// Neo4j response
const mockQueryResponse = {
  records: [{
    get: () => mockTemplate
  }]
}

const createCommand = (params, selectionSet) => {
  const session = jest.fn()
  const pubsub = jest.fn()

  const command = new RequestControlActionCommand(params, selectionSet, session, pubsub)

  return {
    command,
    session,
    pubsub
  }
}

describe('RequestControlActionCommand', function () {
  it('should be defined', () => {
    expect(RequestControlActionCommand).toBeDefined()
  })

  it('should create the request input', () => {
    const { command } = createCommand(mockParamsValid, mockSelectionSet)
    const requestInput = command._retrieveRequestInput(mockParamsValid)

    expect(requestInput).toMatchObject({
      potentialActionIdentifier: '1883f5f6-2359-48e6-83bd-f665dc151b7f',
      entryPointIdentifier: 'd3c4b30a-a013-4465-8431-7283a907bef7'
    })
  })

  it('should throw an UserInputError when the request input is missing required values', () => {
    const { command } = createCommand(mockParamsMissingRequired, mockSelectionSet)
    const requestInput = command._retrieveRequestInput()

    expect(() => command._generateCreatePropertyValuesClause(mockTemplate, requestInput)).toThrow(UserInputError)
  })

  it('should add unique alias properties to the given property and property value objects', () => {
    const { command } = createCommand(mockParamsValid, mockSelectionSet)
    const requestInput = command._retrieveRequestInput()

    expect(requestInput.propertyObject[0].alias).toEqual('node_1')
    expect(requestInput.propertyObject[0].propertyValueAlias).toEqual('propertyValue_1')

    expect(requestInput.propertyObject[1].alias).toEqual('node_2')
    expect(requestInput.propertyObject[1].propertyValueAlias).toEqual('propertyValue_2')

    expect(requestInput.propertyValueObject[0].propertyValueAlias).toEqual('propertyValue_3')
    expect(requestInput.propertyValueObject[1].propertyValueAlias).toEqual('propertyValue_4')
    expect(requestInput.propertyValueObject[2].propertyValueAlias).toEqual('propertyValue_5')
    expect(requestInput.propertyValueObject[3].propertyValueAlias).toEqual('propertyValue_6')
    expect(requestInput.propertyValueObject[4].propertyValueAlias).toEqual('propertyValue_7')
  })

  it('should create a valid template query', () => {
    const { command } = createCommand(mockParamsValid, mockSelectionSet)
    const requestInput = command._retrieveRequestInput()
    const templateQuery = command._generateTemplateQuery(requestInput)

    expect(templateQuery).toMatch('MATCH (sa:SoftwareApplication)<-[:ACTION_APPLICATION]-(ep:EntryPoint {identifier:"d3c4b30a-a013-4465-8431-7283a907bef7"})-[:POTENTIAL_ACTION]->(ca:ControlAction {identifier:"1883f5f6-2359-48e6-83bd-f665dc151b7f"}) RETURN ep {`_schemaType`:HEAD(labels(`ep`)), identifier:ep.identifier, name:ep.name, contributor:ep.contributor, title:ep.title, creator:ep.creator, source:ep.source, subject:ep.subject, format:ep.format, language:ep.language, actionApplication:sa, potentialAction:{`_schemaType`:HEAD(labels(`ca`)), identifier:ca.identifier, name:ca.name, contributor:ca.contributor, title:ca.title, description:ca.description, creator:ca.creator, source:ca.source, subject:ca.subject, format:ca.format, language:ca.language, actionStatus:ca.actionStatus, url:ca.url, object:[(ca)-[:`OBJECT`]->(`controlActionTemplate_property`:`Property`) | { `_schemaType`: head( [ label IN labels(controlActionTemplate_property) WHERE label IN ["Property"] ] ), `identifier`:`controlActionTemplate_property`.`identifier`, `title`:`controlActionTemplate_property`.`title`, `name`:`controlActionTemplate_property`.`name`, `description`:`controlActionTemplate_property`.`description`, `rangeIncludes`:`controlActionTemplate_property`.`rangeIncludes`, `valueRequired`:`controlActionTemplate_property`.`valueRequired` }] + [(ca)-[:`OBJECT`]->(`controlActionTemplate_propertyValueSpecification`:`PropertyValueSpecification`) | { `_schemaType`: head( [ label IN labels(controlActionTemplate_propertyValueSpecification) WHERE label IN ["PropertyValueSpecification"] ] ), `identifier`:`controlActionTemplate_propertyValueSpecification`.`identifier`, `title`:`controlActionTemplate_propertyValueSpecification`.`title`, `name`:`controlActionTemplate_propertyValueSpecification`.`name`,`valueName`:`controlActionTemplate_propertyValueSpecification`.`valueName`, `valueRequired`:`controlActionTemplate_propertyValueSpecification`.`valueRequired`, `defaultValue`:`controlActionTemplate_propertyValueSpecification`.`defaultValue`, `stepValue`:`controlActionTemplate_propertyValueSpecification`.`stepValue`, `disambiguatingDescription`:`controlActionTemplate_propertyValueSpecification`.`disambiguatingDescription`, `minValue`:`controlActionTemplate_propertyValueSpecification`.`maxValue`, `multipleValue`:`controlActionTemplate_propertyValueSpecification`.`multipleValue`, `readonlyValue`:`controlActionTemplate_propertyValueSpecification`.`readonlyValue`, `valueMaxLength`:`controlActionTemplate_propertyValueSpecification`.`valueMaxLength`, `valueMinLength`:`controlActionTemplate_propertyValueSpecification`.`valueMinLength`, `valuePattern`:`controlActionTemplate_propertyValueSpecification`.`valuePattern`, `valueRequired`:`controlActionTemplate_propertyValueSpecification`.`valueRequired` }] }} AS _payload')
  })

  it('should create the property value create clause correctly', () => {
    const { command } = createCommand(mockParamsValid, mockSelectionSet)

    const requestInput = command._retrieveRequestInput()
    const createClause = command._generateCreatePropertyValuesClause(mockTemplate, requestInput)

    expect(createClause).toEqual('CREATE (`controlAction`)-[:`OBJECT`]->(`propertyValue_2`:`PropertyValue`:`ThingInterface` {`identifier`: apoc.create.uuid(), `propertyID`:"64b32b94-9897-426e-9400-6e2a3ae670c0", `description`:"The pitch contour of the performance", `title`:"--pitchContour", `name`:"pitch_json", `valueReference`:"DigitalDocument"}), (`controlAction`)-[:`OBJECT`]->(`propertyValue_1`:`PropertyValue`:`ThingInterface` {`identifier`: apoc.create.uuid(), `propertyID`:"22833b28-b02d-4dcc-a05f-43deae0795bd", `description`:"The reference MXL of the performance", `title`:"--inputXML", `name`:"score_file", `valueReference`:"DigitalDocument"}), (`controlAction`)-[:`OBJECT`]->(`propertyValue_3`:`PropertyValue`:`ThingInterface` {`identifier`: apoc.create.uuid(), `propertyID`:"b57fdc7b-59da-4f32-8d71-e85377a4441b", `description`:"undefined", `title`:"dev_threshold", `name`:"--dev_threshold", `valueReference`:"String", `value`:"50"}), (`controlAction`)-[:`OBJECT`]->(`propertyValue_4`:`PropertyValue`:`ThingInterface` {`identifier`: apoc.create.uuid(), `propertyID`:"f45c851c-dc5f-4b46-adc5-6614697a3a49", `description`:"undefined", `title`:"voice", `name`:"--voice", `valueReference`:"String", `value`:"ttl"}), (`controlAction`)-[:`OBJECT`]->(`propertyValue_5`:`PropertyValue`:`ThingInterface` {`identifier`: apoc.create.uuid(), `propertyID`:"e9c8292b-181e-4b64-87da-05c79ac43a49", `description`:"undefined", `title`:"offset", `name`:"--latency", `valueReference`:"String", `value`:"0"}), (`controlAction`)-[:`OBJECT`]->(`propertyValue_6`:`PropertyValue`:`ThingInterface` {`identifier`: apoc.create.uuid(), `propertyID`:"a44a6797-4699-4566-b224-b6b06d660d42", `description`:"undefined", `title`:"endbar", `name`:"--end_bar", `valueReference`:"String", `value`:"1"}), (`controlAction`)-[:`OBJECT`]->(`propertyValue_7`:`PropertyValue`:`ThingInterface` {`identifier`: apoc.create.uuid(), `propertyID`:"c64fccc5-6bd2-4884-b52e-6605533eb59d", `description`:"undefined", `title`:"startbar", `name`:"--start_bar", `valueReference`:"String", `value`:"1"})')
  })
})
