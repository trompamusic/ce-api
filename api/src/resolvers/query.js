import { driver } from "../driver";
import { retrieveNodeData } from "../resolvers"
import { hydrateNodeSearchScore } from "../resolvers";
import { cypherQuery } from "neo4j-graphql-js";
import { neo4jgraphql } from "neo4j-graphql-js";

export const queryResolvers = {
  Query: {
    MusicComposition (object, params, context, resolveInfo) {
      // return [ { firstPerformance:
      //     { name: 'Concert',
      //       identifier: '641679b2-c1d7-432f-baf2-d1f608f97b5c',
      //       wasAttributedTo: [] },
      //   identifier: 'f5b6a92e-184c-4602-82f3-6daa2a7f2eb5' } ];


      // let promise = neo4jgraphql(object, params, context, resolveInfo);
      // promise.then(result => {console.log(result)});
      // return promise;

      // return neo4jgraphql(object, params, context, resolveInfo);
      console.log('Query.MusicComposition');
      const autoQuery = cypherQuery(params, context, resolveInfo);
      // return autoQuery;
      console.log('autoQuery:');
      console.log(autoQuery);

      // works: (WHERE on multiple labels)
      // const query = [
      //   'MATCH (`musicComposition`:`MusicComposition` {}) RETURN `musicComposition` { `musicComposition` ,workSample: head([ musicComposition_workSample IN apoc.cypher.runFirstColumn("MATCH (this)-[r:WORK_EXAMPLE]->(c) WHERE (c:CreativeWork OR c:MusicComposition) RETURN c", {this: musicComposition}, true) | musicComposition_workSample]) } AS `musicComposition` SKIP $offset LIMIT $first',
      //   { offset: 0, first: 1 }
      //   ];

      // works: (UNIONs for multiple labels)
      // console.log('manual Query:');
      // const query = [
      //   'MATCH (`musicComposition`:`MusicComposition` {}) RETURN `musicComposition` { `musicComposition` ,workSample: head([ musicComposition_workSample IN apoc.cypher.runFirstColumn("MATCH (this)-[r:WORK_EXAMPLE]->(ws:CreativeWork) RETURN ws UNION MATCH (ws:MusicComposition) RETURN ws", {this: musicComposition}, true) | musicComposition_workSample]) } AS `result` SKIP $offset LIMIT $first',
      //   { offset: 0, first: 1 }
      // ];
      // return query;


      // console.log(query);
      let session = driver.session();
      return session.run(autoQuery[0], autoQuery[1])
        .then( result => {
          console.log('result:');
          console.log(result);
          const returnData = result.records.map(
            record => {
              console.log('record:');
              console.log(record);
              console.log('record.keys:');
              console.log(record.keys);
              console.log('record._fields:');
              record._fields.map(field => {
                console.log(field);
                //return field;
              });
              return record.keys.map( key => {

                console.log('record.get(key):');
                let data = record.get(key);
                data.firstPerformance._schemaType = 'Event';
                data._schemaType = 'MusicComposition';
                console.log('data:');
                console.log(data);
                return data;
                // let nodeData = retrieveNodeData(result);
                // console.log('nodeData:');
                // return nodeData;
              })
              // console.log(record.get('firstPerformance'));
              // let result = record.get('result');
              // // musicComposition.map(node => {console.log(node)});
              // console.log('result:');
              // console.log(result);
              // let nodeData = retrieveNodeData(result.musicComposition);
              // console.log('nodeData:');
              // console.log(nodeData);
              // return nodeData;
              // return hydrateNodeSearchScore(nodeData, record.get('weight'));
            })
          console.log('returnData');
          console.log(returnData);
          return returnData[0];
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
