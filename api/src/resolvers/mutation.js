import { info, warning } from '../index'
import { driver } from '../driver'
import { retrieveNodeData, pubsub } from '../resolvers'
import RequestControlActionCommand from '../commands/RequestControlActionCommand'
import AddQuery from '../queries/AddQuery'
import RemoveQuery from '../queries/RemoveQuery'

/**
 * @type {{Mutation: {AddActionInterfaceThingInterface(*, *=, *, *): *, RemoveDigitalDocumentPermissionGrantee(*, *=, *, *): *, AddDigitalDocumentPermissionGrantee(*, *=, *, *): *, AddProvenanceActivityInterfaceActionInterface(*, *=, *, *): *, AddEventPerformer(*, *=, *, *): *, RemoveProvenanceEntityInterfaceThingInterface(*, *=, *, *): *, AddVideoObjectMusicBy(*, *=, *, *): *, RemoveOrganizationInterfaceLegalPerson(*, *=, *, *): *, AddMediaObjectInterfaceCreativeWorkInterface(*, *=, *, *): *, AddOrganizationInterfaceLegalPerson(*, *=, *, *): *, RemoveEventPerformer(*, *=, *, *): *, AddEventComposer(*, *=, *, *): *, RemoveProvenanceEntityInterfaceWasGeneratedBy(*, *=, *, *): *, RemoveThingInterfacePotentialAction(*, *=, *, *): *, RemoveActionInterfaceThingInterface(*, *=, *, *): *, AddThingInterfacePotentialAction(*, *=, *, *): *, RemoveProvenanceActivityInterfaceActionInterface(*, *=, *, *): *, RemoveThingInterfaceThingInterface(*, *=, *, *): *, RemoveEventComposer(*, *=, *, *): *, RemoveCreativeWorkInterfaceCreativeWorkInterface(*, *=, *, *): *, RequestControlAction(*, *=, *, *=): *, AddProvenanceAgentInterfaceLegalPerson(*, *=, *, *): *, UpdateControlAction(*, *=, *, *): *, AddThingInterfaceThingInterface(*, *=, *, *): *, RemoveThingInterfaceCreativeWorkInterface(*, *=, *, *): *, RemoveProvenanceEntityInterfaceWasAttributedTo(*, *=, *, *): *, AddActionInterfaceLegalPerson(*, *=, *, *): *, AddProvenanceEntityInterfaceWasAttributedTo(*, *=, *, *): *, AddCreativeWorkInterfaceLegalPerson(*, *=, *, *): *, RemoveMediaObjectInterfaceCreativeWorkInterface(*, *=, *, *): *, AddThingInterfaceCreativeWorkInterface(*, *=, *, *): *, RemoveVideoObjectMusicBy(*, *=, *, *): *, AddProvenanceEntityInterfaceWasGeneratedBy(*, *=, *, *): *, AddSoftwareApplicationSoftwareHelp(*, *=, *, *): *, AddProvenanceEntityInterfaceThingInterface(*, *=, *, *): *, RemoveSoftwareApplicationSoftwareHelp(*, *=, *, *): *, RemoveCreativeWorkInterfaceLegalPerson(*, *=, *, *): *, AddCreativeWorkInterfaceCreativeWorkInterface(*, *=, *, *): *, RemoveActionInterfaceLegalPerson(*, *=, *, *): *, RemoveProvenanceAgentInterfaceLegalPerson(*, *=, *, *): *}}}
 */
export const mutationResolvers = {
  Mutation: {
    RequestControlAction (object, params, ctx, resolveInfo) {
      const command = new RequestControlActionCommand(params, resolveInfo)
      return command.create
    },
    UpdateControlAction (object, params, ctx, resolveInfo) {
      const query = generateUpdateControlActionQuery(params)
      return runQuery(query, 'UpdateControlAction', 'ControlActionMutation')
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

/**
 * @param params
 * @returns {Promise<{from, to} | never>}
 */
const runAdd = function (params) {
  const queryGenerator = new AddQuery(params)
  return runQuery(queryGenerator.query, 'add')
}

/**
 * @param params
 * @returns {Promise<{from, to} | never>}
 */
const runRemove = function (params) {
  const queryGenerator = new RemoveQuery(params)
  return runQuery(queryGenerator.query, 'remove')
}

const generateUpdateControlActionQuery = function (params) {
  let setPropertyClauses = []
  Object.entries(params).forEach(([key, value]) => {
    setPropertyClauses.push(`${key}: "${value}"`)
  })
  return [
    `MATCH (\`controlAction\`:\`ControlAction\`{identifier: "${params.identifier}"})`,
    `SET \`controlAction\` += {${setPropertyClauses.join(', ')}}`,
    `RETURN \`controlAction\` AS \`_payload\``
  ].join(' ')
}

const runQuery = function (query, queryType, publishChannel) {
  info(`query: ${query}`)
  let session = driver.session()
  let promise = session.run(query)
    .then(result => {
      let rt = result.records.map(record => {
        return retrievePayload(record.get('_payload'), queryType)
      })
      const returnValue = rt[0]
      if (typeof publishChannel === 'string' && typeof returnValue.identifier === 'string') {
        pubsub.publish(publishChannel, { ControlActionMutation: returnValue, identifier: returnValue.identifier })
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
    default:
      warning('Unknown payloadType encountered')
  }
}
