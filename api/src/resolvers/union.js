import { retrieveSchemaType } from "../resolvers";

export const unionResolvers = {
  LegalPerson: {
    __resolveType(obj, context, info){
      return retrieveSchemaType(obj);
    },
  },
  Performer: {
    __resolveType(obj, context, info){
      return retrieveSchemaType(obj);
    },
  },
  ThingInterfaced: {
    __resolveType(obj, context, info){
      return retrieveSchemaType(obj);
    },
  },
  MetadataInterfaced: {
    __resolveType(obj, context, info){
      return retrieveSchemaType(obj);
    },
  },
  CreativeWorkInterfaced: {
    __resolveType(obj, context, info){
      return retrieveSchemaType(obj);
    },
  },
  MediaObjectInterfaced: {
    __resolveType(obj, context, info){
      return retrieveSchemaType(obj);
    },
  },
  OrganizationInterfaced: {
    __resolveType(obj, context, info){
      return retrieveSchemaType(obj);
    },
  },
  ActionInterfaced: {
    __resolveType(obj, context, info){
      return retrieveSchemaType(obj);
    },
  },
  ProvenanceEntityInterfaced: {
    __resolveType(obj, context, info){
      return retrieveSchemaType(obj);
    },
  },
  ProvenanceAgentInterfaced: {
    __resolveType(obj, context, info){
      return retrieveSchemaType(obj);
    },
  },
  ProvenanceActivityInterfaced: {
    __resolveType(obj, context, info){
      return retrieveSchemaType(obj);
    },
  },
}


