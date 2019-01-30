import { driver } from "../driver";
import { retrieveNodeData } from "../resolvers"
import { hydrateNodeSearchScore } from "../resolvers";
import { cypherQuery } from "neo4j-graphql-js";
import { neo4jgraphql } from "neo4j-graphql-js";

export const queryResolvers = {
  Query: {
    MusicComposition (object, params, context, resolveInfo) {
      //return neo4jgraphql(object, params, context, resolveInfo);
      console.log('Query.MusicComposition');
      // const query = cypherQuery(params, context, resolveInfo);
      // console.log(query);

      // works: (WHERE on multiple labels)
      // const query = [
      //   'MATCH (`musicComposition`:`MusicComposition` {}) RETURN `musicComposition` { `musicComposition` ,workSample: head([ musicComposition_workSample IN apoc.cypher.runFirstColumn("MATCH (this)-[r:WORK_EXAMPLE]->(c) WHERE (c:CreativeWork OR c:MusicComposition) RETURN c", {this: musicComposition}, true) | musicComposition_workSample]) } AS `musicComposition` SKIP $offset LIMIT $first',
      //   { offset: 0, first: 1 }
      //   ];

      // works: (UNIONs for multiple labels)
      const query = [
        'MATCH (`musicComposition`:`MusicComposition` {}) RETURN `musicComposition` { `musicComposition` ,workSample: head([ musicComposition_workSample IN apoc.cypher.runFirstColumn("MATCH (this)-[r:WORK_EXAMPLE]->(ws:CreativeWork) RETURN ws UNION MATCH (ws:MusicComposition) RETURN ws", {this: musicComposition}, true) | musicComposition_workSample]) } AS `musicComposition` SKIP $offset LIMIT $first',
        { offset: 0, first: 1 }
      ];

      console.log(query);
      let session = driver.session();
      return session.run(query[0], query[1])
        .then( result => {
          return result.records.map(
            record => {
              let musicComposition = record.get('musicComposition');
              // musicComposition.map(node => {console.log(node)});
              console.log('musicComposition:');
              console.log(musicComposition);
              let nodeData = retrieveNodeData(record.get('musicComposition'));
              console.log(nodeData);
              return nodeData;
              // return hydrateNodeSearchScore(nodeData, record.get('weight'));
            })
        })
      // return query;
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
        .catch(function (error) {console.log(error);});
    }
  }
}
