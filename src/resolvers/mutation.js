import { parse } from 'path'
import walkSync from 'walk-sync'
import { info, warning } from '../utils/logger'
import { driver } from '../driver'
import { retrieveNodeData, pubsub } from '../resolvers'
import RequestControlActionCommand from '../commands/RequestControlActionCommand'
import QueryAndPublishResolver from '../commands/QueryAndPublishResolver'
import UpdateControlActionQuery from '../queries/UpdateControlActionQuery'

export const mutationResolvers = {
  Mutation: {
    RequestControlAction (object, params, ctx, resolveInfo) {
      const command = new RequestControlActionCommand(params, resolveInfo)
      return command.create
    },
    UpdateControlAction (object, params, ctx, resolveInfo) {
      const queryGenerator = new UpdateControlActionQuery(params, resolveInfo)
      return runQuery(queryGenerator.query, 'UpdateControlAction', 'ControlActionMutation')
    },
    CreateMediaObject: QueryAndPublishResolver.createResolver('MediaObject', 'MediaObjectCreateMutation'),
    CreateVideoObject: QueryAndPublishResolver.createResolver('VideoObject', 'VideoObjectCreateMutation'),
    CreateAudioObject: QueryAndPublishResolver.createResolver('AudioObject', 'AudioObjectCreateMutation')
  }
}

// add resolvers for all create mutations
walkSync(`${__dirname}/../schema/type`, { directories: false, includeBasePath: true, globs: ['*.graphql'] })
  .forEach(file => {
    const { name } = parse(file)

    if (!mutationResolvers.Mutation[`Create${name}`]) {
      mutationResolvers.Mutation[`Create${name}`] = QueryAndPublishResolver.createResolver(name)
    }
  })

/**
 * @param query
 * @param queryType
 * @param publishChannel
 * @returns {Promise<{from, to} | never>}
 */
const runQuery = function (query, queryType, publishChannel) {
  info(`query: ${query}`)
  let session = driver.session()

  return session.run(query)
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
}

/**
 * @param payload
 * @param payloadType
 * @returns {*}
 */
const retrievePayload = function (payload, payloadType) {
  switch (payloadType) {
    case 'add':
    case 'remove':
      return {
        from: retrieveNodeData(payload.from),
        to: retrieveNodeData(payload.to)
      }
    case 'RequestControlAction':
      return payload.properties
    case 'UpdateControlAction':
      return payload
    default:
      warning('Unknown payloadType encountered')
  }
}
