import { debug, info, warning } from "../index"
import { driver } from "../driver";
import { retrieveNodeData } from "../resolvers"
import { hydrateNodeSearchScore } from "../resolvers";
import GetQuery from "../queries/GetQuery";


export const queryResolvers = {
  Query: {
    Person (object, params, context, resolveInfo) {
      return getQuery(params, resolveInfo);
    },
    CreativeWork (object, params, context, resolveInfo) {
      return getQuery(params, resolveInfo);
    },
    Article (object, params, context, resolveInfo) {
      return getQuery(params, resolveInfo);
    },
    DigitalDocument (object, params, context, resolveInfo) {
      return getQuery(params, resolveInfo);
    },
    MediaObject (object, params, context, resolveInfo) {
      return getQuery(params, resolveInfo);
    },
    Review (object, params, context, resolveInfo) {
      return getQuery(params, resolveInfo);
    },
    AudioObject (object, params, context, resolveInfo) {
      return getQuery(params, resolveInfo);
    },
    DataDownload (object, params, context, resolveInfo) {
      return getQuery(params, resolveInfo);
    },
    Dataset (object, params, context, resolveInfo) {
      return getQuery(params, resolveInfo);
    },
    ImageObject (object, params, context, resolveInfo) {
      return getQuery(params, resolveInfo);
    },
    MusicComposition (object, params, context, resolveInfo) {
      return getQuery(params, resolveInfo);
    },
    MusicPlaylist (object, params, context, resolveInfo) {
      return getQuery(params, resolveInfo);
    },
    MusicAlbum (object, params, context, resolveInfo) {
      return getQuery(params, resolveInfo);
    },
    MusicRecording (object, params, context, resolveInfo) {
      return getQuery(params, resolveInfo);
    },
    VideoObject (object, params, context, resolveInfo) {
      return getQuery(params, resolveInfo);
    },
    Event (object, params, context, resolveInfo) {
      return getQuery(params, resolveInfo);
    },
    Organization (object, params, context, resolveInfo) {
      return getQuery(params, resolveInfo);
    },
    MusicGroup (object, params, context, resolveInfo) {
      return getQuery(params, resolveInfo);
    },
    Product (object, params, context, resolveInfo) {
      return getQuery(params, resolveInfo);
    },
    Place (object, params, context, resolveInfo) {
      return getQuery(params, resolveInfo);
    },
    Occupation (object, params, context, resolveInfo) {
      return getQuery(params, resolveInfo);
    },
    DigitalDocumentPermission (object, params, context, resolveInfo) {
      return getQuery(params, resolveInfo);
    },
    Audience (object, params, context, resolveInfo) {
      return getQuery(params, resolveInfo);
    },
    searchMetadataText(object, params, context, resolveInfo){
      // determine whether to evaluate only a subset of MetadataInterfaced types
      const doEvaluateTypeSubset = !(params.onTypes === undefined || params.onTypes.length == 0 || params.onTypes.length == resolveInfo.schema._typeMap.MetadataInterfaceType._values.length)
      // determine whether to evaluate only a subset of Metadata fields
      const doEvaluateFieldSubset = !(params.onFields === undefined || params.onFields.length == 0 || params.onFields.length == resolveInfo.schema._typeMap.SearchableMetadataFields._values.length)

      // generate query clause
      // If all metadataInterfaced types AND all metadata textfields need to be evaluated: [substring]~ suffies
      let indexQueryClause = params.substring + '~';
      // if only a subset of types and/or fields need to be evaluated: build query clause for [substring]~ on all eligible types/fields
      if(doEvaluateTypeSubset || doEvaluateFieldSubset){
        const typeNames = doEvaluateTypeSubset ? params.onTypes : resolveInfo.schema._typeMap.MetadataInterfaceType._values.map(type => {return type.name});
        const fieldNames = doEvaluateFieldSubset ? params.onFields : resolveInfo.schema._typeMap.SearchableMetadataFields._values.map(field => {return field.name});
        const substring = indexQueryClause;
        indexQueryClause = '';
        typeNames.map(type => {
          fieldNames.map(field => {
            indexQueryClause += type + '.' + field + ':' + substring + ' OR ';
          })
        })
        indexQueryClause = indexQueryClause.substring(0,indexQueryClause.length-4);
      }
      const searchQuery = 'CALL apoc.index.search("metadata", "' + indexQueryClause + '") YIELD `node`, `weight` RETURN `node`, `weight` ORDER BY `weight` DESC SKIP $offset LIMIT $first';

      // fetch and process search results
      let session = driver.session();
      return session.run(searchQuery, params)
        .then( result => {
          return result.records.map(
            record => {
              let nodeData = retrieveNodeData(record.get('node'));
              return hydrateNodeSearchScore(nodeData, record.get('weight'));
            })
        })
        .catch(function (error) {
          throw Error(error.toString());
        });
    }
  }
}

const getQuery = function (params, resolveInfo) {
  const queryGenerator = new GetQuery(params, resolveInfo);
  const query = queryGenerator.query;
  info(`query: ${query}`);

  let session = driver.session();
  return session.run(query, params)
    .then( result => {
      return result.records.map(
        record => {
          return record._fields.shift();
        })
    })
    .catch(function (error) {
      throw Error(error.toString());
    });
}
