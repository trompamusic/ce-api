import { info } from '../index'
import { driver } from '../driver'
import { retrieveNodeData, hydrateNodeSearchScore } from '../resolvers'
import GetControlActionByTargetQuery from '../queries/GetControlActionByTargetQuery'
import GetQuery from '../queries/GetQuery'
import SearchQuery from '../queries/SearchQuery'

export const queryResolvers = {
  Query: {
    PropertyValue (object, params, context, resolveInfo) {
      return getQuery(params, resolveInfo)
    },
    EntryPoint (object, params, context, resolveInfo) {
      return getQuery(params, resolveInfo)
    },
    ControlAction (object, params, context, resolveInfo) {
      return getQuery(params, resolveInfo, params.targetIdentifier ? GetControlActionByTargetQuery : GetQuery)
    },
    Person (object, params, context, resolveInfo) {
      return getQuery(params, resolveInfo)
    },
    CreativeWork (object, params, context, resolveInfo) {
      return getQuery(params, resolveInfo)
    },
    Article (object, params, context, resolveInfo) {
      return getQuery(params, resolveInfo)
    },
    DigitalDocument (object, params, context, resolveInfo) {
      return getQuery(params, resolveInfo)
    },
    MediaObject (object, params, context, resolveInfo) {
      return getQuery(params, resolveInfo)
    },
    Review (object, params, context, resolveInfo) {
      return getQuery(params, resolveInfo)
    },
    AudioObject (object, params, context, resolveInfo) {
      return getQuery(params, resolveInfo)
    },
    DataDownload (object, params, context, resolveInfo) {
      return getQuery(params, resolveInfo)
    },
    Dataset (object, params, context, resolveInfo) {
      return getQuery(params, resolveInfo)
    },
    ImageObject (object, params, context, resolveInfo) {
      return getQuery(params, resolveInfo)
    },
    MusicComposition (object, params, context, resolveInfo) {
      return getQuery(params, resolveInfo)
    },
    MusicPlaylist (object, params, context, resolveInfo) {
      return getQuery(params, resolveInfo)
    },
    MusicAlbum (object, params, context, resolveInfo) {
      return getQuery(params, resolveInfo)
    },
    MusicRecording (object, params, context, resolveInfo) {
      return getQuery(params, resolveInfo)
    },
    VideoObject (object, params, context, resolveInfo) {
      return getQuery(params, resolveInfo)
    },
    Event (object, params, context, resolveInfo) {
      return getQuery(params, resolveInfo)
    },
    Organization (object, params, context, resolveInfo) {
      return getQuery(params, resolveInfo)
    },
    MusicGroup (object, params, context, resolveInfo) {
      return getQuery(params, resolveInfo)
    },
    Product (object, params, context, resolveInfo) {
      return getQuery(params, resolveInfo)
    },
    Place (object, params, context, resolveInfo) {
      return getQuery(params, resolveInfo)
    },
    Occupation (object, params, context, resolveInfo) {
      return getQuery(params, resolveInfo)
    },
    DigitalDocumentPermission (object, params, context, resolveInfo) {
      return getQuery(params, resolveInfo)
    },
    Audience (object, params, context, resolveInfo) {
      return getQuery(params, resolveInfo)
    },
    searchMetadataText (object, params, context, resolveInfo) {
      const queryGenerator = new SearchQuery(params, resolveInfo)
      const query = queryGenerator.query
      info(`query: ${query}`)

      // fetch and process search results
      let session = driver.session()
      return session.run(query, params)
        .then(result => {
          return result.records.map(
            record => {
              let nodeData = retrieveNodeData(record.get('node'))
              return hydrateNodeSearchScore(nodeData, record.get('score'))
            })
        })
        .catch(function (error) {
          throw Error(error.toString())
        })
    }
  }
}

const getQuery = function (params, resolveInfo, QueryBuilder = GetQuery) {
  const queryGenerator = new QueryBuilder(params, resolveInfo)
  const query = queryGenerator.query
  info(`query: ${query}`)

  let session = driver.session()
  return session.run(query, params)
    .then(result => {
      return result.records.map(
        record => {
          return record._fields.shift()
        })
    })
    .catch(function (error) {
      throw Error(error.toString())
    })
}