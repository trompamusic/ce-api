import { retrieveSchemaType } from "../resolvers";

const MetadataInterfaceTypeUniqueProperties = {"articleBody":"Article","hasDigitalDocumentPermission":"DigitalDocument","itemReviewed":"Review","contentUrl":"MediaObject","videoQuality":"VideoObject","transcript":"AudioObject","distribution":"Dataset","measurementTechnique":"DataDownload","exifData":"ImageObject","albumProductionType":"MusicAlbum","numTracks":"MusicPlaylist","firstPerformance":"MusicComposition","inPlaylist":"MusicRecording"};
const CreativeWorkInterfaceTypeUniqueProperties = {"articleBody":"Article","hasDigitalDocumentPermission":"DigitalDocument","itemReviewed":"Review","contentUrl":"MediaObject","videoQuality":"VideoObject","transcript":"AudioObject","distribution":"Dataset","measurementTechnique":"DataDownload","exifData":"ImageObject","albumProductionType":"MusicAlbum","numTracks":"MusicPlaylist","firstPerformance":"MusicComposition","inPlaylist":"MusicRecording"};
const legalPersonTypeUniqueProperties = {"album":"MusicGroup","birthDate":"Person"};

export const unionResolvers = {
  Performer: {
    __resolveType(obj, context, info){
      const schemaType = retrieveSchemaType(obj);
      if(schemaType){
        return schemaType;
      }

      if(obj.birthDate){
        return 'Person';
      }
      return 'MusicGroup';
    },
  },
  LegalPerson: {
    __resolveType(obj, context, info){
      const schemaType = retrieveSchemaType(obj);
      if(schemaType){
        return schemaType;
      }

      for (var key in legalPersonTypeUniqueProperties) {
        if(key in obj){
          return legalPersonTypeUniqueProperties[key];
        }
      }
      return 'Organization';
    },
  },
  CreativeWorkInterfaced: {
    __resolveType(obj, context, info){
      const schemaType = retrieveSchemaType(obj);
      if(typeof schemaType === 'string'){
        return schemaType;
      }

      // if no schemaType was passed along, try resolving the type by evaluating fields
      for (var key in CreativeWorkInterfaceTypeUniqueProperties) {
        if(key in obj){
          return CreativeWorkInterfaceTypeUniqueProperties[key];
        }
      }
      return 'CreativeWork';
    },
  },
  MetadataInterfaced: {
    __resolveType(obj, context, info){
      const schemaType = retrieveSchemaType(obj);
      if(typeof schemaType === 'string'){
        return schemaType;
      }

      // try to resolve type by interpreting object properties
      for (var key in MetadataInterfaceTypeUniqueProperties) {
        if(key in obj){
          const type = MetadataInterfaceTypeUniqueProperties[key];
          return type;
        }
      }
      return null;
    },
  }
}