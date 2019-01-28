import { driver } from "../driver";
import snakeCase from "lodash/snakeCase";
import { retrieveNodeData } from "../resolvers"

export const mutationResolvers = {
  Mutation: {
    AddThingInterfaceThingInterface (object, params, ctx, resolveInfo) {
      return run(params, 'CREATE');
    },
    RemoveThingInterfaceThingInterface (object, params, ctx, resolveInfo) {
      return run(params, 'DELETE');
    },
    AddThingInterfaceCreativeWorkInterface (object, params, ctx, resolveInfo) {
      return run(params, 'CREATE');
    },
    RemoveThingInterfaceCreativeWorkInterface (object, params, ctx, resolveInfo) {
      return run(params, 'DELETE');
    },
    AddThingInterfacePotentialAction (object, params, ctx, resolveInfo) {
      params.field = 'potentialAction';
      return run(params, 'CREATE');
    },
    RemoveThingInterfacePotentialAction (object, params, ctx, resolveInfo) {
      params.field = 'potentialAction';
      return run(params, 'DELETE');
    },
    AddCreativeWorkInterfaceLegalPerson (object, params, ctx, resolveInfo) {
      return run(params, 'CREATE');
    },
    RemoveCreativeWorkInterfaceLegalPerson (object, params, ctx, resolveInfo) {
      return run(params, 'DELETE');
    },
    AddOrganizationInterfaceLegalPerson (object, params, ctx, resolveInfo) {
      return run(params, 'CREATE');
    },
    RemoveOrganizationInterfaceLegalPerson (object, params, ctx, resolveInfo) {
      return run(params, 'DELETE');
    },
    AddCreativeWorkInterfaceCreativeWorkInterface (object, params, ctx, resolveInfo) {
      return run(params, 'CREATE');
    },
    RemoveCreativeWorkInterfaceCreativeWorkInterface (object, params, ctx, resolveInfo) {
      return run(params, 'DELETE');
    },
    AddMediaObjectInterfaceCreativeWorkInterface (object, params, ctx, resolveInfo) {
      return run(params, 'CREATE');
    },
    RemoveMediaObjectInterfaceCreativeWorkInterface (object, params, ctx, resolveInfo) {
      return run(params, 'DELETE');
    },
    AddActionInterfaceLegalPerson (object, params, ctx, resolveInfo) {
      return run(params, 'CREATE');
    },
    RemoveActionInterfaceLegalPerson (object, params, ctx, resolveInfo) {
      return run(params, 'DELETE');
    },
    AddDigitalDocumentPermissionGrantee (object, params, ctx, resolveInfo) {
      params.from.type = 'DigitalDocumentPermission';
      params.field = 'grantee';
      return run(params, 'CREATE');
    },
    RemoveDigitalDocumentPermissionGrantee (object, params, ctx, resolveInfo) {
      params.from.type = 'DigitalDocumentPermission';
      params.field = 'grantee';
      return run(params, 'DELETE');
    },
    AddEventComposer (object, params, ctx, resolveInfo) {
      params.from.type = 'Event';
      params.field = 'composer';
      return run(params, 'CREATE');
    },
    RemoveEventComposer (object, params, ctx, resolveInfo) {
      params.from.type = 'Event';
      params.field = 'composer';
      return run(params, 'DELETE');
    },
    AddEventPerformer (object, params, ctx, resolveInfo) {
      params.from.type = 'Event';
      params.field = 'performer';
      return run(params, 'CREATE');
    },
    RemoveEventPerformer (object, params, ctx, resolveInfo) {
      params.from.type = 'Event';
      params.field = 'performer';
      return run(params, 'DELETE');
    },
    AddVideoObjectMusicBy (object, params, ctx, resolveInfo) {
      params.from.type = 'VideoObject';
      params.field = 'musicBy';
      return run(params, 'CREATE');
    },
    RemoveVideoObjectMusicBy (object, params, ctx, resolveInfo) {
      params.from.type = 'VideoObject';
      params.field = 'musicBy';
      return run(params, 'DELETE');
    },
    AddProvenanceEntityInterfaceWasAttributedTo (object, params, ctx, resolveInfo) {
      params.field = 'wasAttributedTo';
      return run(params, 'CREATE');
    },
    RemoveProvenanceEntityInterfaceWasAttributedTo (object, params, ctx, resolveInfo) {
      params.field = 'wasAttributedTo';
      return run(params, 'DELETE');
    },
    AddProvenanceAgentInterfaceLegalPerson (object, params, ctx, resolveInfo) {
      return run(params, 'CREATE');
    },
    RemoveProvenanceAgentInterfaceLegalPerson (object, params, ctx, resolveInfo) {
      return run(params, 'DELETE');
    },
    AddActionInterfaceThingInterface (object, params, ctx, resolveInfo) {
      return run(params, 'CREATE');
    },
    RemoveActionInterfaceThingInterface (object, params, ctx, resolveInfo) {
      return run(params, 'DELETE');
    },
    AddProvenanceEntityInterfaceThingInterface (object, params, ctx, resolveInfo) {
      return run(params, 'CREATE');
    },
    RemoveProvenanceEntityInterfaceThingInterface (object, params, ctx, resolveInfo) {
      return run(params, 'DELETE');
    },
    AddProvenanceEntityInterfaceWasGeneratedBy (object, params, ctx, resolveInfo) {
      params.field = 'wasGeneratedBy';
      return run(params, 'CREATE');
    },
    RemoveProvenanceEntityInterfaceWasGeneratedBy (object, params, ctx, resolveInfo) {
      params.field = 'wasGeneratedBy';
      return run(params, 'DELETE');
    },
    AddProvenanceActivityInterfaceActionInterface (object, params, ctx, resolveInfo) {
      return run(params, 'CREATE');
    },
    RemoveProvenanceActivityInterfaceActionInterface (object, params, ctx, resolveInfo) {
      return run(params, 'DELETE');
    },
  }
}

const run = function (params, action) {
  return runQuery(generateQuery(params, action));
}

const generateQuery = function (params, action) {
  return "MATCH (`node_from`:`" + params.from.type + "` {identifier: \"" + params.from.identifier + "\"})" +
    " MATCH (`node_to`: `" + params.to.type + "` {identifier: \"" + params.to.identifier + "\"})" +
    " " + action + " (`node_from`)-[`relation`:`" + snakeCase(params.field).toUpperCase() + "`]->(`node_to`)" +
    " RETURN { from: `node_from` ,to: `node_to` } AS `_payload`;";
}

const runQuery = function (query) {
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