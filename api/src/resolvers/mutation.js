import {driver} from "../driver";

export const mutationResolvers = {
  Mutation: {
    AddMusicCompositionAuthor (object, params, ctx, resolveInfo) {
      let session = driver.session();
      let query = "MATCH (`musicComposition_from`:`MusicComposition` {identifier: $from.identifier})" +
        " MATCH (`legalPerson_to`: `" + params.to.type + "` {identifier: $to.identifier})" +
        " CREATE (`musicComposition_from`)-[`author_relation`:`AUTHOR`]->(`legalPerson_to`)" +
        " RETURN { from: `musicComposition_from` ,to: `legalPerson_to` } AS `_AddMusicCompositionAuthorPayload`;"

      let promise = session.run(query, params)
        .then( result => {
          let rt = result.records.map(record => {
            let data = record.get("_AddMusicCompositionAuthorPayload");
            return {from:data.from.properties, to:data.to.properties};
          });
          return rt[0];
        })
        .catch(function (error) {console.log(error);});

      return promise;
    },
    AddCreativeWorkInterfaceExampleOfWork (object, params, ctx, resolveInfo) {
      let session = driver.session();
      let query = "MATCH (`creativeWorkInterface_from`:`" + params.from.type + "` {identifier: $from.identifier})" +
        " MATCH (`creativeWorkInterfaced_to`: `" + params.to.type + "` {identifier: $to.identifier})" +
        " CREATE (`creativeWorkInterface_from`)-[`exampleOfWork_relation`:`EXAMPLE_OF_WORK`]->(`creativeWorkInterfaced_to`)" +
        " RETURN { from: `creativeWorkInterface_from` ,to: `creativeWorkInterfaced_to` } AS `_AddCreativeWorkInterfaceExampleOfWorkPayload`;"

      let promise = session.run(query, params)
        .then( result => {
          let rt = result.records.map(record => {
            let data = record.get("_AddCreativeWorkInterfaceExampleOfWorkPayload");
            return {from:data.from.properties, to:data.to.properties};
          });
          return rt[0];
        })
        .catch(function (error) {console.log(error);});

      return promise;
    }
  }
}