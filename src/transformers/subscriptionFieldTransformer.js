import { TransformRootFields } from 'graphql-tools'
import { pubsub } from '../resolvers'

// add custom subscription triggers for specific types (key)
const customTypeTriggers = {
  MediaObject: 'MediaObjectCreateMutation',
  VideoObject: 'VideoObjectCreateMutation',
  AudioObject: 'AudioObjectCreateMutation'
}

export const subscriptionFieldTransformer = new TransformRootFields((operation, fieldName, field) => {
  // subscriptions are only triggered for mutations
  if (operation !== 'Mutation' || fieldName === 'RequestControlAction') {
    return undefined
  }

  // ignore custom mutations with custom resolvers
  if (fieldName === 'UpdateControlAction' || fieldName === 'RequestControlAction') {
    return undefined
  }

  const next = field.resolve

  field.resolve = (object, params, context, resolveInfo) => {
    const isThingInterfaceType = resolveInfo.returnType._interfaces.some(current => current.name === 'ThingInterface')
    const typeName = resolveInfo.returnType.name

    // this isn't a ThingInterface related mutation, proceed
    if (!isThingInterfaceType) {
      return next(object, params, context, resolveInfo)
    }

    const selections = resolveInfo.fieldNodes[0] && resolveInfo.fieldNodes[0].selectionSet.selections
    const hasIdentifier = selections && selections.find(({ name }) => name.value === 'identifier')

    // add identifier to selections
    if (!hasIdentifier) {
      resolveInfo.fieldNodes[0].selectionSet.selections.push({
        kind: 'Field',
        name: {
          kind: 'Name',
          value: 'identifier'
        },
        arguments: [],
        directives: []
      })
    }

    return next(object, params, context, resolveInfo).then(response => {
      // remove the identifier so it doesn't end up in the response if the original request does not include it in
      // its response
      if (!hasIdentifier) {
        const idx = selections.findIndex(({ name }) => name.value === 'identifier')

        selections.splice(idx, 1)
      }

      // publish for subscriptions
      if (response.identifier) {
        // always trigger a ThingCreateMutation
        pubsub.publish('ThingCreateMutation', { type: typeName, identifier: response.identifier })

        if (customTypeTriggers[typeName]) {
          pubsub.publish(customTypeTriggers[typeName], { type: typeName, identifier: response.identifier, params })
        }
      }

      return response
    })
  }
})
