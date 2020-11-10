/**
 * @param {Transaction} transactions
 * @param {Driver} driver
 * @returns {Promise<void>}
 */
export default async (transactions, driver) => {
  // it is not possible to conditionally run the drop or createNodeIndex queries without failing
  // to mitigate this problem, we query the DB first to test if the `metadataSearchFields` index is already present
  const result = await driver.session().run('CALL db.indexes() YIELD indexName WHERE indexName = \'metadataSearchFields\' RETURN count(*) as indices')
  const indexExists = result.records[0].get('indices') > 0

  // we have a index, add the remove transaction first
  if (indexExists) {
    transactions.run('CALL db.index.fulltext.drop(\'metadataSearchFields\')')
  }

  // create index transaction
  transactions.run(`
    CALL db.index.fulltext.createNodeIndex('metadataSearchFields', ['Person', 'CreativeWork', 'Article', 'DigitalDocument',
   'MediaObject', 'Review', 'AudioObject', 'DataDownload', 'Dataset', 'ImageObject', 'MusicComposition', 'MusicPlaylist',
   'MusicRecording', 'VideoObject', 'Event', 'Organization', 'MusicGroup', 'Product', 'Place'], ['title', 'creator',
   'description', 'subject'], {eventually_consistent: true, analyzer: 'english'})
  `)
}
