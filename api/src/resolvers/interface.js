import { retrieveSchemaType } from "../resolvers"

export const interfaceResolvers = {
  MetadataInterface: {
    __resolveType(obj, context, info){
      const schemaType = retrieveSchemaType(obj);
      if(schemaType){
        return schemaType;
      }

      var typeUniqueProperties = {"target":"Action","isBasedOn":"CreativeWork","attendee":"Event","department":"Organization","birthData":"Person","containedInPlace":"Place","manufacturer":"Product","grantee":"DigitalDocumentPermission","occupationLocation":"Occupation","videoQuality":"VideoObject","transcript":"AudioObject","distribution":"Dataset","measurementTechnique":"DataDownload","exifData":"ImageObject","albumProductionType":"MusicAlbum","numTracks":"MusicPlaylist","firstPerformance":"MusicComposition","inPlaylist":"MusicRecording"};
      for (var key in typeUniqueProperties) {
        if(key in typeUniqueProperties){
          return typeUniqueProperties[key];
        }
      }
      return null;
    },
  },
  ThingInterface: {
    __resolveType(obj, context, info){
      const schemaType = retrieveSchemaType(obj);
      if(schemaType){
        return schemaType;
      }

      var typeUniqueProperties = {"target":"Action","isBasedOn":"CreativeWork","attendee":"Event","department":"Organization","birthData":"Person","containedInPlace":"Place","manufacturer":"Product","grantee":"DigitalDocumentPermission","occupationLocation":"Occupation","videoQuality":"VideoObject","transcript":"AudioObject","distribution":"Dataset","measurementTechnique":"DataDownload","exifData":"ImageObject","albumProductionType":"MusicAlbum","numTracks":"MusicPlaylist","firstPerformance":"MusicComposition","inPlaylist":"MusicRecording"};
      for (var key in typeUniqueProperties) {
        if(key in obj){
          return typeUniqueProperties[key];
        }
      }
      return null;
    },
  },
  CreativeWorkInterface: {
    __resolveType(obj, context, info){
      console.log('CreativeWorkInterface.__resolveType');
      const schemaType = retrieveSchemaType(obj);
      if(schemaType){
        return schemaType;
      }
      // if(obj.hasOwnProperty('_schemaType') && obj._schemaType != "undefined"){
      //   return obj._schemaType;
      // }

      var typeUniqueProperties = {"articleBody":"Article","hasDigitalDocumentPermission":"DigitalDocument","itemReviewed":"Review","contentUrl":"MediaObject","videoQuality":"VideoObject","transcript":"AudioObject","distribution":"Dataset","measurementTechnique":"DataDownload","exifData":"ImageObject","albumProductionType":"MusicAlbum","numTracks":"MusicPlaylist","firstPerformance":"MusicComposition","inPlaylist":"MusicRecording"};
      for (var key in typeUniqueProperties) {
        if(key in obj){
          return typeUniqueProperties[key];
        }
      }
      return 'CreativeWork';
    },
  },
  MediaObjectInterface: {
    __resolveType(obj, context, info){
      const schemaType = retrieveSchemaType(obj);
      if(schemaType){
        return schemaType;
      }

      var typeUniqueProperties = {"videoQuality":"VideoObject","transcript":"AudioObject","distribution":"Dataset","measurementTechnique":"DataDownload","exifData":"ImageObject","albumProductionType":"MusicAlbum","numTracks":"MusicPlaylist","firstPerformance":"MusicComposition","inPlaylist":"MusicRecording"};
      for (var key in typeUniqueProperties) {
        if(key in obj){
          return typeUniqueProperties[key];
        }
      }
      return 'MediaObject';
    },
  },
  OrganizationInterface: {
    __resolveType(obj, context, info){
      const schemaType = retrieveSchemaType(obj);
      if(schemaType){
        return schemaType;
      }

      if(obj.album){
        return 'MusicGroup';
      }
      return 'Organization';
    },
  },
  ActionInterface: {
    __resolveType(obj, context, info){
      const schemaType = retrieveSchemaType(obj);
      if(schemaType){
        return schemaType;
      }

      if(obj.replacer){
        return 'ReplaceAction';
      }
      if(context.targetCollection){
        return 'UpdateAction';
      }
      return 'Action';
    },
  },
}