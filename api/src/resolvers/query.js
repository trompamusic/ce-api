import { driver } from "../driver";

export const queryResolvers = {
  Query: {
    searchMetadataBySubstring (object, params, context, resolveInfo) {
      // determine types to include in search: types passed with query parameters, or if left empty; all metadataInterfaced types
      const searchIncludedTypes = (params.onTypes === undefined || params.onTypes.length == 0) ? resolveInfo.schema._typeMap.MetadataInterfacedType._values : params.onTypes;
      // generate query clause for the types included in the query
      let typeClause = "(";
      typeClause += searchIncludedTypes.map(
        type => {
          const typeName = (type.hasOwnProperty('name')) ? type.name : type;
          return "`node`:`" + typeName + "` OR ";
        }).join('');
      typeClause = typeClause.substring(0,typeClause.length-4) + ")";

      // determine metadata fields to evaluate in the search query: fields passed with query parameters, or if left empty; all SearchableMetadataFields
      const searchIncludedFields = (params.onFields === undefined || params.onFields.length == 0) ? resolveInfo.schema._typeMap.SearchableMetadataFields._values : params.onFields;
      // generate query clause for the metadata fields to be searched
      let fieldClause = "(";
      fieldClause += searchIncludedFields.map(
        field => {
          const fieldName = (field.hasOwnProperty('name')) ? field.name : field;
          return "toLower(`node`.`" + fieldName + "`) CONTAINS toLower($substring) OR ";
        }).join('');
      fieldClause = fieldClause.substring(0,fieldClause.length-4) + ")";

      const searchQuery = "MATCH (`node`) WHERE " + typeClause + " AND " + fieldClause + " RETURN `node` as `result` SKIP $offset LIMIT $first";

      let session = driver.session();
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
              return object;
            })
          return toReturn;
        })
    },
  }
}
