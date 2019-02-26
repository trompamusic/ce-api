import { driver } from "../driver";
import { retrieveNodeData } from "../resolvers"
import { hydrateNodeSearchScore } from "../resolvers";
import GetQuery from "../queries/GetQuery";
import { lowercaseFirstCharacter } from "../resolvers";
import { cypherQuery } from "neo4j-graphql-js";
import { neo4jgraphql } from "neo4j-graphql-js";

export const queryResolvers = {
  Query: {
    MusicComposition (object, params, context, resolveInfo) {
      const queryGenerator = new GetQuery(params, resolveInfo);
      const query = queryGenerator.query;

      console.log('query:');
      console.log(query);

      // const autoQuery = [
      //   query,
      //   params
      // ];

      console.log('neo4jgraphql generated:');
      console.log(neo4jgraphql(object, params, context, resolveInfo, true));

      let session = driver.session();
      return session.run(query, params)
        .then( result => {
          // console.log('result:');
          // console.log(result);
          // console.log('result.records[0]._fields:');
          // console.log(result.records[0]._fields);
          return result.records.map(
            record => {
              console.log('record:');
              console.log(record._fields[0].firstPerformance);
              // console.log('record.keys:');
              // console.log(record.keys);
              // console.log('record._fields:');
              // console.log(record._fields);
              // record._fields.map(field => {
              //   console.log('field:');
              //   console.log(field);
              //   //return field;
              // });
              return record._fields.shift();
            })
        })
        .catch(function (error) {console.log(error);});
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

// const selectionSetClause = function (parentType, parentAlias, selectionSet, schema) {
//   // const [selectionSet] = sets;
//   // console.log('selectionSetClause, selectionSet:');
//   // console.log(selectionSet);
//   let properties = ['_schemaType'];
//   let relations = [];
//   switch(selectionSet.kind){
//     case "SelectionSet":
//       selectionSet.selections.map(selection => {
//         console.log('selection:');
//         console.log(selection);
//         switch(selection.kind){
//           case "Field":
//             if(selection.selectionSet === undefined){
//               properties.push("." + selection.name.value);
//             } else {
//               // this is a deeper node with its own properties - recurse
//               properties.push(embeddedNodeClause(parentType, parentAlias, selection, schema));
//             }
//             break;
//           default:
//             console.log('unknown selection Kind encountered: ' + selection.kind);
//         }
//       });
//       break;
//     default:
//       console.log('unknown selectionSet kind encountered: ' + selectionSet.kind);
//   }
//
//   console.log('properties:');
//   console.log(properties.join(', '));
//   // console.log('relations:');
//   // console.log(relations);
//   let clause = properties.join(', ');
//
//   return clause;
// }
//
// const embeddedNodeClause = function (parentType, parentAlias, selection, schema) {
//   console.log(selection);
//   console.log(schema);
//   const alias = parentAlias + "_" + selection.name.value;
//   const relation = findRelation(parentType, selection.name.value);
//   console.log(relation);
//   //const relationType =
//
//   // TODO interpret arrayed/non arrayed relation properties (HEAD)
//   let clause = selection.name.value + ":HEAD([(`" + parentAlias + "`)-[:`Event`]->(`" + alias + "`:`Event`) | {`_schemaType`:HEAD(labels(`" + alias + "`)), `identifier`:`" + alias + "`.`identifier`, `name`:`" + alias + "`.`name`}]) ";
//
//
//   return clause;
// }

