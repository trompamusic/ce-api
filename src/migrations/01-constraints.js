import { assertSchema } from 'neo4j-graphql-js'
import { schema } from '../schema'

/**
 * @param {Transaction} transactions
 * @param {Driver} driver
 * @returns {Promise<void>}
 */
export default async (transactions, driver) => {
  // remove the fulltext index, if this exists while calling assertSchema, we get an error
  await driver.session().run(`CALL db.indexes() YIELD name, provider WHERE provider = "fulltext-1.0" 
    CALL db.index.fulltext.drop(name)
    RETURN TRUE`)

  // run the assertSchema which creates all constraints based on the @id directives
  await assertSchema({ schema, driver, debug: false, dropExisting: true })

  // create index transaction
  transactions.run(`
    CALL db.index.fulltext.createNodeIndex('metadataSearchFields', ['Person', 'CreativeWork', 'Article', 'DigitalDocument',
   'MediaObject', 'Review', 'AudioObject', 'DataDownload', 'Dataset', 'ImageObject', 'MusicComposition', 'MusicPlaylist',
   'MusicRecording', 'VideoObject', 'Event', 'Organization', 'MusicGroup', 'Product', 'Place'], ['title', 'creator',
   'description', 'subject'])
  `)
}
