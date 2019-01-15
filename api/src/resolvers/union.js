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
        if(key in obj){
          return typeUniqueProperties[key];
        }
      }
      return 'Organization';
    },
  },
  CreativeWorkBase: {
    __resolveType(obj, context, info){
      var typeUniqueProperties = {"manufacturer":"Product","articleBody":"Article","hasDigitalDocumentPermission":"DigitalDocument","itemReviewed":"Review", "videoQuality":"VideoObject","transcript":"AudioObject","distribution":"Dataset","measurementTechnique":"DataDownload","exifData":"ImageObject","firstPerformance":"MusicComposition","numTracks":"MusicPlaylist","inAlbum":"MusicRecording","contentUrl":"MediaObject"};
      for (var key in typeUniqueProperties) {
        if(key in obj){
          return typeUniqueProperties[key];
        }
      }
      return 'CreativeWork';
    },
  },
}