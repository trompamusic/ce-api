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
      var typeUniqueProperties = {"album":"MusicGroup","birthDate":"Person"};
      for (var key in typeUniqueProperties) {
        if(key in obj){
          return typeUniqueProperties[key];
        }
      }
      return 'Organization';
    },
  },
  CreativeWorkInterfaced: {
    __resolveType(obj, context, info){
      var typeUniqueProperties = {"articleBody":"Article","hasDigitalDocumentPermission":"DigitalDocument","itemReviewed":"Review","contentUrl":"MediaObject","videoQuality":"VideoObject","transcript":"AudioObject","distribution":"Dataset","measurementTechnique":"DataDownload","exifData":"ImageObject","albumProductionType":"MusicAlbum","numTracks":"MusicPlaylist","firstPerformance":"MusicComposition","inPlaylist":"MusicRecording"};
      for (var key in typeUniqueProperties) {
        console.log(key);
        if(key in obj){
          return typeUniqueProperties[key];
        }
      }
      return 'CreativeWork';
    },
  },
}