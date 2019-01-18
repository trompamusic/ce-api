import { driver } from "../driver";
import { cypherQuery } from "neo4j-graphql-js";

export const queryResolvers = {
  Query: {
    searchMetadataBySubstring (object, params, context, resolveInfo) {
      // determine which types to include in search: types passed with query parameters, or if left empty; all metadataInterfaced types
      const searchIncludedTypes = (params.onTypes === undefined || params.onTypes.length == 0) ? resolveInfo.schema._typeMap.MetadataInterfacedType._values : params.onTypes;
      // generate query clause for the types included in the query
      let typeClause = "(";
      typeClause += searchIncludedTypes.map(
        type => {
          const typeName = (type.hasOwnProperty('name')) ? type.name : type;
          return "result:" + typeName + " OR ";
        }).join('');
      typeClause = typeClause.substring(0,typeClause.length-4) + ")";
      console.log(typeClause);

      // determine which metadata fields to evaluate in the search query: fields passed with query parameters, or if left empty; all SearchableMetadataFields
      const searchIncludedFields = (params.onFields === undefined || params.onFields.length == 0) ? resolveInfo.schema._typeMap.SearchableMetadataFields._values : params.onFields;
      // generate query clause for the metadata fields to be searched
      let fieldClause = "(";
      fieldClause += searchIncludedFields.map(
        field => {
          const fieldName = (field.hasOwnProperty('name')) ? field.name : field;
          return "toLower(result." + fieldName + ") CONTAINS toLower($substring) OR ";
        }).join('');
      fieldClause = fieldClause.substring(0,fieldClause.length-4) + ")";
      console.log(fieldClause);

      const searchQuery = "MATCH (result) WHERE " + typeClause + " AND " + fieldClause + " RETURN result";

      //console.log(resolveInfo.fieldNodes[0].selectionSet.selections[0].selectionSet);
      //resolveInfo.fieldNodes.map( node => {console.log(node.selectionSet.selections); node.selectionSet.selections.map( selection => {console.log('selection-set:'); console.log(selection)})});
      let session = driver.session();
      let query = "MATCH (result)" +
        "WHERE NOT (result:Action OR result:Intangible OR result:PropertyValue)" +
        "AND (toLower(result.name) CONTAINS toLower($substring) " +
          "OR toLower(result.description) CONTAINS toLower($substring) " +
          "OR toLower(result.creator) CONTAINS toLower($substring) " +
          "OR toLower(result.subject) CONTAINS toLower($substring)) " +
        "RETURN result";
      return session.run(searchQuery, params)
        .then( result => {
          const toReturn = result.records.map(
            record => {
              const object = record.get("result").properties;
              const labels = record.get("result").labels;
              if (labels instanceof Array && labels.length > 0){
                object._schemaType = labels.shift();
                object._additionalSchemaType = labels;
              }
              console.log(object);
              return object;
            })
          //console.log(toReturn);
          return toReturn;
        })
    },
  }

}
