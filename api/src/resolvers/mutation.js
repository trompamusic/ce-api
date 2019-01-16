import {driver} from "../driver";

export const mutationResolvers = {
  Mutation: {
    AddCreativeWorkInterfaceAuthor (object, params, ctx, resolveInfo) {
      let session = driver.session();
      let query = "MATCH (`creativeWorkInterface_from`:`" + params.from.type + "` {identifier: $from.identifier})" +
        " MATCH (`legalPerson_to`: `" + params.to.type + "` {identifier: $to.identifier})" +
        " CREATE (`creativeWorkInterface_from`)-[`author_relation`:`AUTHOR`]->(`legalPerson_to`)" +
        " RETURN { from: `creativeWorkInterface_from` ,to: `legalPerson_to` } AS `_AddCreativeWorkInterfaceAuthorPayload`;"

      let promise = session.run(query, params)
        .then( result => {
          let rt = result.records.map(record => {
            let data = record.get("_AddCreativeWorkInterfaceAuthorPayload");
            return {from:data.from.properties, to:data.to.properties};
          });

          return rt[0];
        })
        .catch(function (error) {console.log(error);});

      return promise;
    }
  }
}