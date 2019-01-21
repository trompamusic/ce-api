const metadataInterfacedTypeUniqueProperties = {"articleBody":"Article","hasDigitalDocumentPermission":"DigitalDocument","itemReviewed":"Review","contentUrl":"MediaObject","videoQuality":"VideoObject","transcript":"AudioObject","distribution":"Dataset","measurementTechnique":"DataDownload","exifData":"ImageObject","albumProductionType":"MusicAlbum","numTracks":"MusicPlaylist","firstPerformance":"MusicComposition","inPlaylist":"MusicRecording"};
const creativeWorkInterfacedTypeUniqueProperties = {"articleBody":"Article","hasDigitalDocumentPermission":"DigitalDocument","itemReviewed":"Review","contentUrl":"MediaObject","videoQuality":"VideoObject","transcript":"AudioObject","distribution":"Dataset","measurementTechnique":"DataDownload","exifData":"ImageObject","albumProductionType":"MusicAlbum","numTracks":"MusicPlaylist","firstPerformance":"MusicComposition","inPlaylist":"MusicRecording"};
const legalPersonTypeUniqueProperties = {"album":"MusicGroup","birthDate":"Person"};

export const unionResolvers = {
  MusicCreator: {
    __resolveType(obj, context, info){
      if(obj.birthDate){
        return 'Person';
      }
      return 'MusicGroup';
    },
  },
  LegalPerson: {
    __resolveType(obj, context, info){
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
      for (var key in creativeWorkInterfacedTypeUniqueProperties) {
        if(key in obj){
          return creativeWorkInterfacedTypeUniqueProperties[key];
        }
      }
      return 'CreativeWork';
    },
  },
  MetadataInterfaced: {
    __resolveType(obj, context, info){
      // if set, return first element of label array
      if(obj.hasOwnProperty('_schemaType') && obj._schemaType != "undefined"){
        console.log('object type resolved as ' + obj._schemaType + ' (_schemaType property)');
        return obj._schemaType;
      }

      // try to resolve type by interpreting object properties
      for (var key in metadataInterfacedTypeUniqueProperties) {
        if(key in obj){
          const type = metadataInterfacedTypeUniqueProperties[key];
          console.log('object type resolved as ' + type + ' (interpreting typeUniqueProperties)');
          return type;
        }
      }
      return null;
    },
  }
}