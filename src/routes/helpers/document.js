import { info } from '../../utils/logger'
import { driver } from '../../driver'
import GetTypeQuery from '../../queries/GetTypeQuery'
import GetFullNodeQuery from '../../queries/GetFullNodeQuery'
import SchemaHelper from '../../helpers/SchemaHelper'
import fs from 'fs'
import path from 'path'

export const getDocument = (identifier, host) => {
  const session = driver.session()
  const schemaHelper = new SchemaHelper()

  const getTypeQuery = new GetTypeQuery(identifier, schemaHelper.getTypeNames())
  const query = getTypeQuery.query

  info(`_findNodeType query: ${query}`)

  return session.run(query)
    // find a node with matching identifier
    .then(typeResult => {
      const rt = typeResult.records.map(record => {
        return record.get('_payload')
      })
      // only interpret the first result
      return rt[0]
    })
    // determine type of node and query for all scalar properties and 1st order relations
    .then(typeResult => {
      const type = typeResult && typeResult._schemaType

      if (!type) {
        return Promise.reject(new Error('Node not found'))
      }

      // Special-case some types to perform a custom query to get additional relations in a single query
      // Unfortunately neo4j-graphql-js doesn't provide an easy way to do this, so we do the following:
      // Start up the CE with DEBUG=neo4j-graphql-js
      // Take the file ./queries/TYPE.query and run it in the web interface
      // Copy the query which is written to the console to ./queries/TYPE.cypher
      if (type === "ItemList") {
        return getItemList(session, identifier).then(data => ({data, type}));
      }

      return getNodeProperties(session, type, identifier, host)
        .then(data => ({ data, type }))
    }, reason => {
      throw reason
    })
    .catch(function (error) {
      info('_findNodeType caught error' + error.message)
      throw error
    })
}

const getItemList = (session, identifier) => {
  const query = fs.readFileSync(path.resolve(__dirname, './queries/ItemList.cypher'), {encoding:'utf8', flag:'r'});
  return session.run(query, {identifier: identifier, ThingInterface_derivedTypes: [
          "Action",
          "AddAction",
          "Annotation",
          "Article",
          "Audience",
          "AudioObject",
          "ControlAction",
          "DataDownload",
          "Dataset",
          "DefinedTerm",
          "DefinedTermSet",
          "DeleteAction",
          "DigitalDocument",
          "DigitalDocumentPermission",
          "EntryPoint",
          "Event",
          "ImageObject",
          "Intangible",
          "ItemList",
          "ListItem",
          "MediaObject",
          "MusicAlbum",
          "MusicComposition",
          "MusicGroup",
          "MusicPlaylist",
          "MusicRecording",
          "Occupation",
          "Organization",
          "Person",
          "Place",
          "Product",
          "Property",
          "PropertyValue",
          "PropertyValueSpecification",
          "Rating",
          "ReplaceAction",
          "Review",
          "SoftwareApplication",
          "VideoObject"
      ]})
      .then(fullResult => {
          if (fullResult.records.length) {
              return fullResult.records[0].get('itemList')
          } else {
              return undefined;
          }
      })
      .catch(function (error) {
        info('_getItemList caught error: ' + error.message)
        throw error
      })
}

const getNodeProperties = (session, type, identifier, host) => {
  const getFullNodeQuery = new GetFullNodeQuery(type, identifier, host, 2)
  const query = getFullNodeQuery.query
  info(`_qetFullNodeQuery: ${query}`)

  return session.run(query)
    .then(fullResult => {
      // find the node with all properties and 1st order relations
      const rt = fullResult.records.map(record => {
        return record.get('_payload')
      })
      // only interpret the first result
      return rt[0]
    })
    .catch(function (error) {
      info('_getNodeProperties caught error' + error.message)
      throw error
    })
}

export const isValidLanguage = (data, acceptLanguage) => {
  /*
  Checks if the Accept-Language header matches the language field of a document.
  For a header like fr-CH, fr;q=0.9, en;q=0.8, de;q=0.7, *;q=0.5
  remove scores and reduce language codes down to 2 characters.
  If Accept-Language contains *, or if it contains the value of data.language
  then return true, otherwise return false;
   */
  if (!acceptLanguage) {
    // If language header isn't set, it's valid
    return true;
  }
  const langs = acceptLanguage.replaceAll(" ", "").split(",").map(
      e => e.split(";")[0].slice(0,2)
  );
  if (langs.includes("*")) {
    // * as an accepted language = all languages
    return true;
  }
  // Otherwise only return true if the document language is an accepted language
  return langs.includes(data.language);
}
