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
      console.log('LegalPerson __resolveType called');
      var typeUniqueProperties = {"album":"MusicGroup","birthDate":"Person"};
      for (var key in typeUniqueProperties) {
        console.log(key);
        if(key in obj){
          return typeUniqueProperties[key];
        }
      }
      console.log('no type matching property found, returning `Organization`');
      return 'Organization';
    },
  },
  CreativeWorkInterfaced: {
    __resolveType(obj, context, info){
      console.log('CreativeWorkInterfaced __resolveType called');
      var typeUniqueProperties = {"articleBody":"Article","hasDigitalDocumentPermission":"DigitalDocument","itemReviewed":"Review","contentUrl":"MediaObject","videoQuality":"VideoObject","transcript":"AudioObject","distribution":"Dataset","measurementTechnique":"DataDownload","exifData":"ImageObject","albumProductionType":"MusicAlbum","numTracks":"MusicPlaylist","firstPerformance":"MusicComposition","inPlaylist":"MusicRecording"};
      for (var key in typeUniqueProperties) {
        console.log(key);
        if(key in obj){
          return typeUniqueProperties[key];
        }
      }
      console.log('no type matching property found, returning `CreativeWork`');
      return 'CreativeWork';
    },
  },
}