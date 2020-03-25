CALL db.index.fulltext.createNodeIndex('metadataSearchFields', ['Person', 'CreativeWork', 'Article', 'DigitalDocument',
  'MediaObject', 'Review', 'AudioObject', 'DataDownload', 'Dataset', 'ImageObject', 'MusicComposition', 'MusicPlaylist',
  'MusicRecording', 'VideoObject', 'Event', 'Organization', 'MusicGroup', 'Product', 'Place'], ['title', 'creator',
  'description', 'subject'], {eventually_consistent: true, analyzer: 'english'})
