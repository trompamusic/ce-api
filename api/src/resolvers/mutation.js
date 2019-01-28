import { driver } from "../driver";
import snakeCase from "lodash/snakeCase";
import { retrieveNodeData } from "../resolvers"

export const mutationResolvers = {
  Mutation: {
    AddThingInterfaceCreativeWorkInterface (object, params, ctx, resolveInfo) {
      return runAdd(params);
    },
    AddCreativeWorkInterfaceLegalPerson (object, params, ctx, resolveInfo) {
      return runAdd(params);
    },
    AddOrganizationInterfaceLegalPerson (object, params, ctx, resolveInfo) {
      return runAdd(params);
    },
    AddCreativeWorkInterfaceCreativeWorkInterface (object, params, ctx, resolveInfo) {
      return runAdd(params);
    },
    AddMediaObjectInterfaceCreativeWorkInterface (object, params, ctx, resolveInfo) {
      return runAdd(params);
    },
    AddActionInterfaceLegalPerson (object, params, ctx, resolveInfo) {
      return runAdd(params);
    },
    AddDigitalDocumentPermissionGrantee (object, params, ctx, resolveInfo) {
      params.from.type = 'DigitalDocumentPermission';
      params.field = 'grantee';
      return runAdd(params);
    },
    AddEventComposer (object, params, ctx, resolveInfo) {
      params.from.type = 'Event';
      params.field = 'composer';
      return runAdd(params);
    },
    AddEventPerformer (object, params, ctx, resolveInfo) {
      params.from.type = 'Event';
      params.field = 'performer';
      return runAdd(params);
    },
    AddVideoObjectMusicBy (object, params, ctx, resolveInfo) {
      params.from.type = 'VideoObject';
      params.field = 'musicBy';
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