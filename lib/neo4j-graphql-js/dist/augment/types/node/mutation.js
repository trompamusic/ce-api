"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs2/helpers/interopRequireDefault");

var _Object$defineProperty = require("@babel/runtime-corejs2/core-js/object/define-property");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.augmentNodeMutationAPI = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/defineProperty"));

var _values = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/values"));

var _graphql = require("graphql");

var _ast = require("../../ast");

var _directives = require("../../directives");

var _utils = require("../../../utils");

var _augment = require("../../augment");

var _types = require("../../types/types");

var _fields = require("../../fields");

/**
 * An enum describing the names of node type mutations
 */
var NodeMutation = {
  CREATE: 'Create',
  UPDATE: 'Update',
  DELETE: 'Delete',
  MERGE: 'Merge'
};
/**
 * Given the results of augmentNodeTypeFields, builds or augments
 * the AST definitions of the Mutation operation fields and any
 * generated input or output types required for translation
 */

var augmentNodeMutationAPI = function augmentNodeMutationAPI(_ref) {
  var definition = _ref.definition,
      typeName = _ref.typeName,
      propertyInputValues = _ref.propertyInputValues,
      generatedTypeMap = _ref.generatedTypeMap,
      operationTypeMap = _ref.operationTypeMap,
      config = _ref.config;
  var primaryKey = (0, _utils.getPrimaryKey)(definition);
  var mutationTypeName = _types.OperationType.MUTATION;
  var mutationType = operationTypeMap[mutationTypeName];
  var mutationTypeNameLower = mutationTypeName.toLowerCase();

  if (mutationType && !(0, _types.isInterfaceTypeDefinition)({
    definition: definition
  }) && (0, _augment.shouldAugmentType)(config, mutationTypeNameLower, typeName)) {
    (0, _values["default"])(NodeMutation).forEach(function (mutationAction) {
      operationTypeMap = buildNodeMutationField({
        mutationType: mutationType,
        mutationAction: mutationAction,
        primaryKey: primaryKey,
        typeName: typeName,
        propertyInputValues: propertyInputValues,
        operationTypeMap: operationTypeMap,
        config: config
      });
    });
  }

  return [operationTypeMap, generatedTypeMap];
};
/**
 * Given the results of augmentNodeTypeFields, builds the AST
 * definition for a Mutation operation field of a given
 * NodeMutation name
 */


exports.augmentNodeMutationAPI = augmentNodeMutationAPI;

var buildNodeMutationField = function buildNodeMutationField(_ref2) {
  var mutationType = _ref2.mutationType,
      mutationAction = _ref2.mutationAction,
      primaryKey = _ref2.primaryKey,
      typeName = _ref2.typeName,
      propertyInputValues = _ref2.propertyInputValues,
      operationTypeMap = _ref2.operationTypeMap,
      config = _ref2.config;
  var mutationFields = mutationType.fields;
  var mutationName = "".concat(mutationAction).concat(typeName);

  if (!(0, _fields.getFieldDefinition)({
    fields: mutationFields,
    name: mutationName
  })) {
    var mutationField = {
      name: (0, _ast.buildName)({
        name: mutationName
      }),
      args: buildNodeMutationArguments({
        operationName: mutationAction,
        primaryKey: primaryKey,
        args: propertyInputValues
      }),
      type: (0, _ast.buildNamedType)({
        name: typeName
      }),
      directives: buildNodeMutationDirectives({
        mutationAction: mutationAction,
        typeName: typeName,
        config: config
      })
    };

    if (mutationAction === NodeMutation.CREATE) {
      mutationFields.push((0, _ast.buildField)(mutationField));
    } else if (mutationAction === NodeMutation.UPDATE || mutationAction === NodeMutation.MERGE) {
      if (primaryKey && mutationField.args.length > 1) {
        mutationFields.push((0, _ast.buildField)(mutationField));
      }
    } else if (mutationAction === NodeMutation.DELETE) {
      if (primaryKey) {
        mutationFields.push((0, _ast.buildField)(mutationField));
      }
    }

    operationTypeMap[_types.OperationType.MUTATION].fields = mutationFields;
  }

  return operationTypeMap;
};
/**
 * Builds the AST for the input value definitions used as arguments
 * on generated node Mutation fields of NodeMutation names
 */


var buildNodeMutationArguments = function buildNodeMutationArguments(_ref3) {
  var _ref3$operationName = _ref3.operationName,
      operationName = _ref3$operationName === void 0 ? '' : _ref3$operationName,
      primaryKey = _ref3.primaryKey,
      _ref3$args = _ref3.args,
      args = _ref3$args === void 0 ? [] : _ref3$args;
  var primaryKeyName = primaryKey ? primaryKey.name.value : '';
  args = args.reduce(function (args, field) {
    var name = field.name;
    var directives = field.directives;

    if (!(0, _fields.isNeo4jIDField)({
      name: name
    }) && !(0, _directives.isCypherField)({
      directives: directives
    })) {
      var type = field.type;

      if (operationName === NodeMutation.CREATE) {
        // Uses primary key and any other property field
        if (primaryKeyName === name) {
          if (type.name === _graphql.GraphQLID.name) {
            // Create auto-generates ID primary keys
            args.push({
              name: name,
              type: {
                name: type.name
              }
            });
          } else {
            args.push({
              name: name,
              type: {
                name: type.name,
                wrappers: type.wrappers
              }
            });
          }
        } else {
          args.push({
            name: name,
            type: type
          });
        }
      } else if (operationName === NodeMutation.UPDATE || operationName === NodeMutation.MERGE) {
        // Uses primary key and any other property field
        if (primaryKeyName === name) {
          // Require primary key otherwise
          args.push({
            name: name,
            type: {
              name: type.name,
              wrappers: (0, _defineProperty2["default"])({}, _fields.TypeWrappers.NON_NULL_NAMED_TYPE, true)
            }
          });
        } else {
          // Persist list type wrapper
          args.push({
            name: name,
            type: {
              name: type.name,
              wrappers: (0, _defineProperty2["default"])({}, _fields.TypeWrappers.LIST_TYPE, type.wrappers[_fields.TypeWrappers.LIST_TYPE])
            }
          });
        }
      } else if (operationName === NodeMutation.DELETE) {
        // Only uses primary key
        if (primaryKeyName === name) {
          // Require primary key otherwise
          args.push({
            name: name,
            type: {
              name: type.name,
              wrappers: (0, _defineProperty2["default"])({}, _fields.TypeWrappers.NON_NULL_NAMED_TYPE, true)
            }
          });
        }
      }
    }

    return args;
  }, []);
  return args.map(function (arg) {
    return (0, _ast.buildInputValue)({
      name: (0, _ast.buildName)({
        name: arg.name
      }),
      type: (0, _ast.buildNamedType)(arg.type)
    });
  });
};
/**
 * Builds the AST definitions for directive instances used by
 * generated node Mutation fields of NodeMutation names
 */


var buildNodeMutationDirectives = function buildNodeMutationDirectives(_ref4) {
  var mutationAction = _ref4.mutationAction,
      typeName = _ref4.typeName,
      config = _ref4.config;
  var directives = [];

  if ((0, _directives.useAuthDirective)(config, _directives.DirectiveDefinition.HAS_SCOPE)) {
    directives.push((0, _directives.buildAuthScopeDirective)({
      scopes: [{
        typeName: typeName,
        mutation: mutationAction
      }]
    }));
  }

  return directives;
};