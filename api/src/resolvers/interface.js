import { retrieveSchemaType } from "../resolvers"

export const interfaceResolvers = {
  MetadataInterface: {
    __resolveType(obj, context, info){
      return retrieveSchemaType(obj);
    },
  },
  ThingInterface: {
    __resolveType(obj, context, info){
      return retrieveSchemaType(obj);
    },
  },
  CreativeWorkInterface: {
    __resolveType(obj, context, info){
      return retrieveSchemaType(obj);
    },
  },
  MediaObjectInterface: {
    __resolveType(obj, context, info){
      return retrieveSchemaType(obj);
    },
  },
  OrganizationInterface: {
    __resolveType(obj, context, info){
      return retrieveSchemaType(obj);
    },
  },
  ActionInterface: {
    __resolveType(obj, context, info){
      return retrieveSchemaType(obj);
    },
  },
}