import { TransformRootFields } from 'graphql-tools'
import QueryAndPublishResolver from '../commands/QueryAndPublishResolver'

// add custom subscription triggers for specific types (key)
const customTypeTriggers = {
  MediaObject: 'MediaObjectCreateMutation',
  VideoObject: 'VideoObjectCreateMutation',
  AudioObject: 'AudioObjectCreateMutation'
}

export const subscriptionFieldTransformer = new TransformRootFields((operation, fieldName, field) => {
  // subscriptions are only triggered for mutations
  if (operation !== 'Mutation') {
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

    const resolve = QueryAndPublishResolver.createResolver(typeName, customTypeTriggers[typeName])

    return resolve(object, params, context, resolveInfo)
  }
})
