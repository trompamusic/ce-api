import { driver } from "../driver";
import snakeCase from "lodash/snakeCase";
import { retrieveNodeData } from "../resolvers"

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
    },
    AddCreativeWorkInterfaceLegalPerson (object, params, ctx, resolveInfo) {
      // console.log(snakeCase(params.field).toUpperCase());
      console.log(params.from.type);
      let session = driver.session();
      let query = "MATCH (`creativeWorkInterface_from`:`" + params.from.type + "` {identifier: $from.identifier})" +
        " MATCH (`legalPerson_to`: `" + params.to.type + "` {identifier: $to.identifier})" +
        " CREATE (`creativeWorkInterface_from`)-[`exampleOfWork_relation`:`" + snakeCase(params.field).toUpperCase() + "`]->(`legalPerson_to`)" +
        " RETURN { from: `creativeWorkInterface_from` ,to: `legalPerson_to` } AS `_AddCreativeWorkInterfaceLegalPersonPayload`;"

      let promise = session.run(query, params)
        .then( result => {
          let rt = result.records.map(record => {
            const payload = record.get("_AddCreativeWorkInterfaceLegalPersonPayload");
            return {
              from:retrieveNodeData(payload.from),
              to:retrieveNodeData(payload.to)
            };
          });
          return rt[0];
        })
        .catch(function (error) {console.log(error);});

      return promise;
    }
  }
}