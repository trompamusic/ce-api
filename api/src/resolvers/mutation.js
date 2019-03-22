import { debug, info, warning } from '../index'
import { driver } from '../driver'
import snakeCase from 'lodash/snakeCase'
import { retrieveNodeData, pubsub } from '../resolvers'
import RequestControlActionCommand from '../commands/RequestControlActionCommand'

export const mutationResolvers = {
  Mutation: {
    RequestControlAction (object, params, ctx, resolveInfo) {
      info('RequestControlAction')
      const command = new RequestControlActionCommand(params, resolveInfo)
      return command.create

      // return handleRequestControlActionRequest(params.controlAction)

      // const queryGenerator = new RequestControlActionQuery(params, resolveInfo)
      // const query = queryGenerator.query
      // info(`query: ${query}`)

      // params.actionStatus = 'accepted'
      // const query = generateRequestControlActionQuery(params)
      // return runQuery(query, 'RequestControlAction')
    },
    UpdateControlAction (object, params, ctx, resolveInfo) {
      const query = generateUpdateControlActionQuery(params)
      return runQuery(query, 'UpdateControlAction')
    },
    AddThingInterfaceThingInterface (object, params, ctx, resolveInfo) {
      return runAdd(params)
    },
    RemoveThingInterfaceThingInterface (object, params, ctx, resolveInfo) {
      return runRemove(params)
    },
    AddThingInterfaceCreativeWorkInterface (object, params, ctx, resolveInfo) {
      return runAdd(params)
    },
    RemoveThingInterfaceCreativeWorkInterface (object, params, ctx, resolveInfo) {
      return runRemove(params)
    },
    AddThingInterfacePotentialAction (object, params, ctx, resolveInfo) {
      params.field = 'potentialAction'
      return runAdd(params)
    },
    RemoveThingInterfacePotentialAction (object, params, ctx, resolveInfo) {
      params.field = 'potentialAction'
      return runRemove(params)
    },
    AddCreativeWorkInterfaceLegalPerson (object, params, ctx, resolveInfo) {
      return runAdd(params)
    },
    RemoveCreativeWorkInterfaceLegalPerson (object, params, ctx, resolveInfo) {
      return runRemove(params)
    },
    AddOrganizationInterfaceLegalPerson (object, params, ctx, resolveInfo) {
      return runAdd(params)
    },
    RemoveOrganizationInterfaceLegalPerson (object, params, ctx, resolveInfo) {
      return runRemove(params)
    },
    AddCreativeWorkInterfaceCreativeWorkInterface (object, params, ctx, resolveInfo) {
      return runAdd(params)
    },
    RemoveCreativeWorkInterfaceCreativeWorkInterface (object, params, ctx, resolveInfo) {
      return runRemove(params)
    },
    AddMediaObjectInterfaceCreativeWorkInterface (object, params, ctx, resolveInfo) {
      return runAdd(params)
    },
    RemoveMediaObjectInterfaceCreativeWorkInterface (object, params, ctx, resolveInfo) {
      return runRemove(params)
    },
    AddActionInterfaceLegalPerson (object, params, ctx, resolveInfo) {
      return runAdd(params)
    },
    RemoveActionInterfaceLegalPerson (object, params, ctx, resolveInfo) {
      return runRemove(params)
    },
    AddDigitalDocumentPermissionGrantee (object, params, ctx, resolveInfo) {
      params.from.type = 'DigitalDocumentPermission'
      params.field = 'grantee'
      return runAdd(params, 'CREATE')
    },
    RemoveDigitalDocumentPermissionGrantee (object, params, ctx, resolveInfo) {
      params.from.type = 'DigitalDocumentPermission'
      params.field = 'grantee'
      return runRemove(params, 'DELETE')
    },
    AddEventComposer (object, params, ctx, resolveInfo) {
      params.from.type = 'Event'
      params.field = 'composer'
      return runAdd(params, 'CREATE')
    },
    RemoveEventComposer (object, params, ctx, resolveInfo) {
      params.from.type = 'Event'
      params.field = 'composer'
      return runRemove(params, 'DELETE')
    },
    AddEventPerformer (object, params, ctx, resolveInfo) {
      params.from.type = 'Event'
      params.field = 'performer'
      return runAdd(params, 'CREATE')
    },
    RemoveEventPerformer (object, params, ctx, resolveInfo) {
      params.from.type = 'Event'
      params.field = 'performer'
      return runRemove(params, 'DELETE')
    },
    AddVideoObjectMusicBy (object, params, ctx, resolveInfo) {
      params.from.type = 'VideoObject'
      params.field = 'musicBy'
      return runAdd(params, 'CREATE')
    },
    RemoveVideoObjectMusicBy (object, params, ctx, resolveInfo) {
      params.from.type = 'VideoObject'
      params.field = 'musicBy'
      return runRemove(params, 'DELETE')
    },
    AddProvenanceEntityInterfaceWasAttributedTo (object, params, ctx, resolveInfo) {
      params.field = 'wasAttributedTo'
      return runAdd(params, 'CREATE')
    },
    RemoveProvenanceEntityInterfaceWasAttributedTo (object, params, ctx, resolveInfo) {
      params.field = 'wasAttributedTo'
      return runRemove(params, 'DELETE')
    },
    AddProvenanceAgentInterfaceLegalPerson (object, params, ctx, resolveInfo) {
      return runAdd(params, 'CREATE')
    },
    RemoveProvenanceAgentInterfaceLegalPerson (object, params, ctx, resolveInfo) {
      return runRemove(params, 'DELETE')
    },
    AddActionInterfaceThingInterface (object, params, ctx, resolveInfo) {
      return runAdd(params, 'CREATE')
    },
    RemoveActionInterfaceThingInterface (object, params, ctx, resolveInfo) {
      return runRemove(params, 'DELETE')
    },
    AddProvenanceEntityInterfaceThingInterface (object, params, ctx, resolveInfo) {
      return runAdd(params, 'CREATE')
    },
    RemoveProvenanceEntityInterfaceThingInterface (object, params, ctx, resolveInfo) {
      return runRemove(params, 'DELETE')
    },
    AddProvenanceEntityInterfaceWasGeneratedBy (object, params, ctx, resolveInfo) {
      params.field = 'wasGeneratedBy'
      return runAdd(params, 'CREATE')
    },
    RemoveProvenanceEntityInterfaceWasGeneratedBy (object, params, ctx, resolveInfo) {
      params.field = 'wasGeneratedBy'
      return runRemove(params, 'DELETE')
    },
    AddProvenanceActivityInterfaceActionInterface (object, params, ctx, resolveInfo) {
      return runAdd(params, 'CREATE')
    },
    RemoveProvenanceActivityInterfaceActionInterface (object, params, ctx, resolveInfo) {
      return runRemove(params, 'DELETE')
    },
    AddSoftwareApplicationSoftwareHelp (object, params, ctx, resolveInfo) {
      return runAdd(params, 'CREATE')
    },
    RemoveSoftwareApplicationSoftwareHelp (object, params, ctx, resolveInfo) {
      return runRemove(params, 'DELETE')
    }
  }
}

const runAdd = function (params) {
  return runQuery(generateAddQuery(params))
}

const runRemove = function (params) {
  return runQuery(generateRemoveQuery(params))
}

// const runSimpleGet = function (params) {
//   return runQuery(generateSimpleGetQuery(params))
// }

const generateAddQuery = function (params) {
  return [
    `MATCH (\`node_from\`:\`${params.from.type}\` {identifier: "${params.from.identifier}"})`,
    `MATCH (\`node_to\`: \`${params.to.type}\` {identifier: "${params.to.identifier}"})`,
    `CREATE (\`node_from\`)-[\`relation\`:\`${snakeCase(params.field).toUpperCase()}\`]->(\`node_to\`)`,
    `RETURN { from: \`node_from\` ,to: \`node_to\` } AS \`_payload\`;`
  ].join(' ')
}

const generateRemoveQuery = function (params) {
  return [
    `MATCH (\`node_from\`:\`${params.from.type}\` {\`identifier\`: "${params.from.identifier}"})`,
    `-[\`relation\`:${snakeCase(params.field).toUpperCase()}]->`,
    `(\`node_to\`: \`${params.to.type}\` {\`identifier\`: "${params.to.identifier}"})`,
    `DELETE \`relation\``,
    `RETURN { from: \`node_from\` ,to: \`node_to\` } AS \`_payload\`;`
  ].join(' ')
}

const generateRequestControlActionQuery = function (params) {
  if (!Array.isArray(params.object) || params.object.length === 0) {
    throw Error('ControlAction.object cannot be empty')
  }

  const objectValues = `["${params.object.join('", "')}"]`

  return [
    `CREATE (\`controlAction\`:\`ControlAction\` {identifier: ${(typeof params.identifier === 'string') ? `"${params.identifier}"` : `randomUUID()`}, target: "${params.target}" , object: ${objectValues}, actionStatus: "${params.actionStatus}", description: "${params.description}"})`,
    `RETURN \`controlAction\` AS \`_payload\``
  ].join(' ')
}

const generateUpdateControlActionQuery = function (params) {
  let setPropertyClauses = [];
  Object.entries(params).forEach(([key, value]) => {
    setPropertyClauses.push(`${key}: "${value}"`)
  })
  return [
    `MATCH (\`controlAction\`:\`ControlAction\`{identifier: "${params.identifier}"})`,
    `SET \`controlAction\` += {${setPropertyClauses.join(', ')}}`,
    `RETURN \`controlAction\` AS \`_payload\``
  ].join(' ')
}

const runQuery = function (query, queryType) {
  info(`query: ${query}`)
  let session = driver.session()
  let promise = session.run(query)
    .then(result => {
      let rt = result.records.map(record => {
        return retrievePayload(record.get('_payload'), queryType)
      })
      const returnValue = rt[0]
      if (typeof returnValue.identifier === 'string') {
        pubsub.publish('ControlActionMutation', { ControlActionMutation: returnValue, identifier: returnValue.identifier })
      }
      return returnValue
    })
    .catch(function (error) {
      throw Error(error.toString())
    })

  return promise
}

const retrievePayload = function (payload, payloadType) {
  switch (payloadType) {
    case 'add':
    case 'remove':
      return {
        from: retrieveNodeData(payload.from),
        to: retrieveNodeData(payload.to)
      }
    // case 'asyncProcess':
    //   return payload
    case 'RequestControlAction':
      return payload.properties
    case 'UpdateControlAction':
      return payload.properties
    // case 'simpleGet':
    //   return payload.properties
    default:
      warning('Unknown payloadType encountered')
  }
}

const handleRequestControlActionRequest = function (payload) {
  info('validateRequestControlActionRequest payload:')
  debug(payload)
  const potentialActionIdentifier = payload.potentialActionIdentifier
  if (typeof potentialActionIdentifier !== 'string') {
    throw Error('Missing parameter: potentialActionIdentifier')
  }

  const potentialAction = runQuery(generateSimpleGetQuery('ControlAction', potentialActionIdentifier), 'simpleGet')
  potentialAction
    .then(result => {
      debug(result)
      debug(typeof result)
      if (typeof result !== 'object') {
        return
      }
      const queryGenerator = new RequestControlActionQuery(payload)
      const query = queryGenerator.query
      info(`query: ${query}`)
    })
}
