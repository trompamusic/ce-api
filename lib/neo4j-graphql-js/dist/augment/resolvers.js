"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs2/helpers/interopRequireDefault");

var _Object$defineProperty = require("@babel/runtime-corejs2/core-js/object/define-property");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.extractResolversFromSchema = exports.augmentResolvers = void 0;

var _keys = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/keys"));

var _index = require("../index");

var _types = require("../augment/types/types");

/**
 * The main export for the generation of resolvers for the
 * Query and Mutation API. Prevent overwriting.
 */
var augmentResolvers = function augmentResolvers(augmentedTypeMap, operationTypeMap, resolvers, config) {
  // Persist and generate Query resolvers
  var queryTypeName = _types.OperationType.QUERY;
  var queryType = operationTypeMap[queryTypeName];

  if (queryType) {
    queryTypeName = queryType.name.value;
    var queryResolvers = resolvers && resolvers[queryTypeName] ? resolvers[queryTypeName] : {};
    queryResolvers = possiblyAddResolvers(queryType, queryResolvers, config);

    if ((0, _keys["default"])(queryResolvers).length > 0) {
      resolvers[queryTypeName] = queryResolvers;
    }
  } // Persist and generate Mutation resolvers


  var mutationTypeName = _types.OperationType.MUTATION;
  var mutationType = operationTypeMap[mutationTypeName];

  if (mutationType) {
    mutationTypeName = mutationType.name.value;
    var mutationResolvers = resolvers && resolvers[mutationTypeName] ? resolvers[mutationTypeName] : {};
    mutationResolvers = possiblyAddResolvers(mutationType, mutationResolvers, config);

    if ((0, _keys["default"])(mutationResolvers).length > 0) {
      resolvers[mutationTypeName] = mutationResolvers;
    }
  } // Persist Subscription resolvers


  var subscriptionTypeName = _types.OperationType.SUBSCRIPTION;
  var subscriptionType = operationTypeMap[subscriptionTypeName];

  if (subscriptionType) {
    subscriptionTypeName = subscriptionType.name.value;
    var subscriptionResolvers = resolvers && resolvers[subscriptionTypeName] ? resolvers[subscriptionTypeName] : {};

    if ((0, _keys["default"])(subscriptionResolvers).length > 0) {
      resolvers[subscriptionTypeName] = subscriptionResolvers;
    }
  } // must implement __resolveInfo for every Interface type
  // we use "FRAGMENT_TYPE" key to identify the Interface implementation
  // type at runtime, so grab this value


  var interfaceTypes = (0, _keys["default"])(augmentedTypeMap).filter(function (e) {
    return augmentedTypeMap[e].kind === 'InterfaceTypeDefinition';
  });
  interfaceTypes.map(function (e) {
    resolvers[e] = {};

    resolvers[e]['__resolveType'] = function (obj, context, info) {
      return obj['FRAGMENT_TYPE'];
    };
  });
  return resolvers;
};
/**
 * Generates resolvers for a given operation type, if
 * any fields exist, for any resolver not provided
 */


exports.augmentResolvers = augmentResolvers;

var possiblyAddResolvers = function possiblyAddResolvers(operationType, resolvers, config) {
  var operationName = '';
  var fields = operationType ? operationType.fields : [];
  var operationTypeMap = fields.reduce(function (acc, t) {
    acc[t.name.value] = t;
    return acc;
  }, {});
  return (0, _keys["default"])(operationTypeMap).reduce(function (acc, t) {
    // if no resolver provided for this operation type field
    operationName = operationTypeMap[t].name.value; // If not provided

    if (acc[operationName] === undefined) {
      acc[operationName] = function () {
        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        return _index.neo4jgraphql.apply(void 0, args.concat([config.debug]));
      };
    }

    return acc;
  }, resolvers);
};
/**
 * Extracts resolvers from a schema
 */


var extractResolversFromSchema = function extractResolversFromSchema(schema) {
  var _typeMap = schema && schema._typeMap ? schema._typeMap : {};

  var types = (0, _keys["default"])(_typeMap);
  var type = {};
  var schemaTypeResolvers = {};
  return types.reduce(function (acc, t) {
    // prevent extraction from schema introspection system keys
    if (t !== '__Schema' && t !== '__Type' && t !== '__TypeKind' && t !== '__Field' && t !== '__InputValue' && t !== '__EnumValue' && t !== '__Directive') {
      type = _typeMap[t]; // resolvers are stored on the field level at a .resolve key

      schemaTypeResolvers = extractFieldResolversFromSchemaType(type); // do not add unless there exists at least one field resolver for type

      if (schemaTypeResolvers) {
        acc[t] = schemaTypeResolvers;
      }
    }

    return acc;
  }, {});
};
/**
 * Extracts field resolvers from a given type taken
 * from a schema
 */


exports.extractResolversFromSchema = extractResolversFromSchema;

var extractFieldResolversFromSchemaType = function extractFieldResolversFromSchemaType(type) {
  var fields = type._fields;
  var fieldKeys = fields ? (0, _keys["default"])(fields) : [];
  var fieldResolvers = fieldKeys.length > 0 ? fieldKeys.reduce(function (acc, t) {
    // do not add entry for this field unless it has resolver
    if (fields[t].resolve !== undefined) {
      acc[t] = fields[t].resolve;
    }

    return acc;
  }, {}) : undefined; // do not return value unless there exists at least 1 field resolver

  return fieldResolvers && (0, _keys["default"])(fieldResolvers).length > 0 ? fieldResolvers : undefined;
};