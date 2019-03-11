import { driver } from '../driver'
import snakeCase from 'lodash/snakeCase'
import { retrieveNodeData, channels, pubsub } from '../resolvers'

let nextId = 3

export const mutationResolvers = {
  Mutation: {
    addAsyncProcess: (root, { asyncProcess }) => {
      const channel = channels.find(channel => channel.id === asyncProcess.channelId)
      if (!channel) {
        throw new Error('Channel does not exist')
      }

      const newAsyncProcess = { id: String(nextId++), text: message.text }
    },
    addMessage: (root, { message }) => {
      const channel = channels.find(channel => channel.id === message.channelId)
      if (!channel) {
        throw new Error('Channel does not exist')
      }

      const newMessage = { id: String(nextId++), text: message.text }
      channel.messages.push(newMessage)

      pubsub.publish('messageAdded', { messageAdded: newMessage, channelId: message.channelId })

      return newMessage
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
    }
  }
}

const runAdd = function (params) {
  return runQuery(generateAddQuery(params))
}

const runRemove = function (params) {
  return runQuery(generateRemoveQuery(params))
}

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

const runQuery = function (query) {
  let session = driver.session()
  let promise = session.run(query)
    .then(result => {
      let rt = result.records.map(record => {
        const payload = record.get('_payload')
        return {
          from: retrieveNodeData(payload.from),
          to: retrieveNodeData(payload.to)
        }
      })
      return rt[0]
    })
    .catch(function (error) {
      throw Error(error.toString())
    })

  return promise
}
