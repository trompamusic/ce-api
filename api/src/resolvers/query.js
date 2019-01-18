import { driver } from "../driver";

export const queryResolvers = {
  Query: {
    byName (object, params, ctx, resolveInfo) {
      console.log('query resolver byName');
      let session = driver.session();
      let query = "MATCH (result) WHERE NOT (result:Action OR result:Intangible OR result:PropertyValue) AND toLower(result.name) CONTAINS toLower($substring) RETURN result"
      return session.run(query, params)
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
          // console.log(toReturn);
          return toReturn;
        })
    },
  }

}
