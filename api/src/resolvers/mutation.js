import { driver } from "../driver";
import snakeCase from "lodash/snakeCase";
import { retrieveNodeData } from "../resolvers"

export const mutationResolvers = {
  Mutation: {
    AddCreativeWorkInterfaceLegalPerson (object, params, ctx, resolveInfo) {
      return runAdd(params);
    },
    AddCreativeWorkInterfaceCreativeWorkInterface (object, params, ctx, resolveInfo) {
      return runAdd(params);
    },
  }
}

const runAdd = function (params) {
  return runAddQuery(generateAddQuery(params));
}

const generateAddQuery = function (params) {
  return "MATCH (`node_from`:`" + params.from.type + "` {identifier: \"" + params.from.identifier + "\"})" +
    " MATCH (`node_to`: `" + params.to.type + "` {identifier: \"" + params.to.identifier + "\"})" +
    " CREATE (`node_from`)-[`relation`:`" + snakeCase(params.field).toUpperCase() + "`]->(`node_to`)" +
    " RETURN { from: `node_from` ,to: `node_to` } AS `_AddedPayload`;";
}

const runAddQuery = function (query) {
  let session = driver.session();
  let promise = session.run(query)
    .then( result => {
      let rt = result.records.map(record => {
        const payload = record.get("_AddedPayload");
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