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
    searchMetadataText(object, params, context, resolveInfo){
      // determine whether to evaluate only a subset of MetadataInterfaced types
      const doEvaluateTypeSubset = !(params.onTypes === undefined || params.onTypes.length == 0 || params.onTypes.length == resolveInfo.schema._typeMap.MetadataInterfacedType._values.length)
      // determine whether to evaluate only a subset of Metadata fields
      const doEvaluateFieldSubset = !(params.onFields === undefined || params.onFields.length == 0 || params.onFields.length == resolveInfo.schema._typeMap.SearchableMetadataFields._values.length)

      // generate query clause
      // If all metadataInterfaced types AND all metadata textfields need to be evaluated: [substring]~ suffies
      let indexQueryClause = params.substring + '~';
      // if only a subset of types and/or fields need to be evaluated: build query clause for [substring]~ on all eligible types/fields
      if(doEvaluateTypeSubset || doEvaluateFieldSubset){
        const typeNames = doEvaluateTypeSubset ? params.onTypes : resolveInfo.schema._typeMap.MetadataInterfacedType._values.map(type => {return type.name});
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

      console.log(searchQuery);
      let session = driver.session();
      return session.run(searchQuery, params)
        .then( result => {
          const toReturn = result.records.map(
            record => {
              const object = record.get("node").properties;
              object.weight = record.get("weight");
              const labels = record.get("node").labels;
              if (labels instanceof Array && labels.length > 0){
                object._schemaType = labels.shift();
                object._additionalSchemaType = labels;
              }
              return object;
            })
          return toReturn;
        })
    }
  }
}
