"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs2/helpers/interopRequireDefault");

var _Object$defineProperty2 = require("@babel/runtime-corejs2/core-js/object/define-property");

_Object$defineProperty2(exports, "__esModule", {
  value: true
});

exports.augmentRelationshipMutationAPI = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/define-property"));

var _defineProperties = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/define-properties"));

var _getOwnPropertyDescriptors = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/get-own-property-descriptors"));

var _getOwnPropertyDescriptor = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/get-own-property-descriptor"));

var _getOwnPropertySymbols = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/get-own-property-symbols"));

var _keys = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/keys"));

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/toConsumableArray"));

var _defineProperty3 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/defineProperty"));

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/slicedToArray"));

var _values = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/values"));

var _relationship = require("./relationship");

var _query = require("./query");

var _augment = require("../../augment");

var _types = require("../../types/types");

var _fields = require("../../fields");

var _directives = require("../../directives");

var _ast = require("../../ast");

var _utils = require("../../../utils");

function ownKeys(object, enumerableOnly) { var keys = (0, _keys["default"])(object); if (_getOwnPropertySymbols["default"]) { var symbols = (0, _getOwnPropertySymbols["default"])(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return (0, _getOwnPropertyDescriptor["default"])(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty3["default"])(target, key, source[key]); }); } else if (_getOwnPropertyDescriptors["default"]) { (0, _defineProperties["default"])(target, (0, _getOwnPropertyDescriptors["default"])(source)); } else { ownKeys(Object(source)).forEach(function (key) { (0, _defineProperty2["default"])(target, key, (0, _getOwnPropertyDescriptor["default"])(source, key)); }); } } return target; }

/**
 * An enum describing the names of relationship mutations,
 * for node and relationship type fields (field and type
 * relation directive)
 */
var RelationshipMutation = {
  CREATE: 'Add',
  DELETE: 'Remove',
  UPDATE: 'Update',
  MERGE: 'Merge'
};
/**
 * Given the results of augmentRelationshipTypeFields, builds or
 * augments the AST definitions of the Mutation operation fields
 * and any generated input or output types required for translation
 */

var augmentRelationshipMutationAPI = function augmentRelationshipMutationAPI(_ref) {
  var typeName = _ref.typeName,
      fieldName = _ref.fieldName,
      outputType = _ref.outputType,
      fromType = _ref.fromType,
      toType = _ref.toType,
      relationshipName = _ref.relationshipName,
      _ref$propertyInputVal = _ref.propertyInputValues,
      propertyInputValues = _ref$propertyInputVal === void 0 ? [] : _ref$propertyInputVal,
      _ref$propertyOutputFi = _ref.propertyOutputFields,
      propertyOutputFields = _ref$propertyOutputFi === void 0 ? [] : _ref$propertyOutputFi,
      typeDefinitionMap = _ref.typeDefinitionMap,
      generatedTypeMap = _ref.generatedTypeMap,
      operationTypeMap = _ref.operationTypeMap,
      config = _ref.config;
  var mutationTypeName = _types.OperationType.MUTATION;
  var mutationType = operationTypeMap[mutationTypeName];
  var mutationTypeNameLower = mutationTypeName.toLowerCase();

  if (mutationType && (0, _augment.shouldAugmentRelationshipField)(config, mutationTypeNameLower, fromType, toType)) {
    (0, _values["default"])(RelationshipMutation).forEach(function (mutationAction) {
      var mutationName = buildRelationshipMutationName({
        mutationAction: mutationAction,
        typeName: typeName,
        fieldName: fieldName
      });
      var fromTypeDefinition = typeDefinitionMap[fromType];
      var toTypeDefinition = typeDefinitionMap[toType];
      var fromTypePk = (0, _utils.getPrimaryKey)(fromTypeDefinition);
      var toTypePk = (0, _utils.getPrimaryKey)(toTypeDefinition);

      if (!(0, _fields.getFieldDefinition)({
        fields: mutationType.fields,
        name: mutationName
      }) && // Only generate mutation API for given relationship if both related
      // nodes have a primary key
      fromTypePk && toTypePk) {
        var _buildRelationshipMut = buildRelationshipMutationAPI({
          mutationAction: mutationAction,
          mutationName: mutationName,
          relationshipName: relationshipName,
          fromType: fromType,
          toType: toType,
          propertyInputValues: propertyInputValues,
          propertyOutputFields: propertyOutputFields,
          outputType: outputType,
          generatedTypeMap: generatedTypeMap,
          operationTypeMap: operationTypeMap,
          config: config
        });

        var _buildRelationshipMut2 = (0, _slicedToArray2["default"])(_buildRelationshipMut, 2);

        operationTypeMap = _buildRelationshipMut2[0];
        generatedTypeMap = _buildRelationshipMut2[1];
      }
    });
  }

  return [typeDefinitionMap, generatedTypeMap, operationTypeMap];
};
/**
 * Builds the AST for the input value definitions used as
 * field arguments on relationship mutations for selecting
 * the related nodes
 */


exports.augmentRelationshipMutationAPI = augmentRelationshipMutationAPI;

var buildNodeSelectionArguments = function buildNodeSelectionArguments(_ref2) {
  var fromType = _ref2.fromType,
      toType = _ref2.toType;
  return [(0, _ast.buildInputValue)({
    name: (0, _ast.buildName)({
      name: _relationship.RelationshipDirectionField.FROM
    }),
    type: (0, _ast.buildNamedType)({
      name: "_".concat(fromType, "Input"),
      wrappers: (0, _defineProperty3["default"])({}, _fields.TypeWrappers.NON_NULL_NAMED_TYPE, true)
    })
  }), (0, _ast.buildInputValue)({
    name: (0, _ast.buildName)({
      name: _relationship.RelationshipDirectionField.TO
    }),
    type: (0, _ast.buildNamedType)({
      name: "_".concat(toType, "Input"),
      wrappers: (0, _defineProperty3["default"])({}, _fields.TypeWrappers.NON_NULL_NAMED_TYPE, true)
    })
  })];
};
/**
 * Builds the AST definitions decided and configured in
 * augmentRelationshipMutationAPI
 */


var buildRelationshipMutationAPI = function buildRelationshipMutationAPI(_ref3) {
  var mutationAction = _ref3.mutationAction,
      mutationName = _ref3.mutationName,
      relationshipName = _ref3.relationshipName,
      fromType = _ref3.fromType,
      toType = _ref3.toType,
      propertyInputValues = _ref3.propertyInputValues,
      propertyOutputFields = _ref3.propertyOutputFields,
      outputType = _ref3.outputType,
      generatedTypeMap = _ref3.generatedTypeMap,
      operationTypeMap = _ref3.operationTypeMap,
      config = _ref3.config;
  var mutationOutputType = "_".concat(mutationName, "Payload");
  operationTypeMap = buildRelationshipMutationField({
    mutationAction: mutationAction,
    mutationName: mutationName,
    relationshipName: relationshipName,
    fromType: fromType,
    toType: toType,
    propertyInputValues: propertyInputValues,
    propertyOutputFields: propertyOutputFields,
    mutationOutputType: mutationOutputType,
    outputType: outputType,
    operationTypeMap: operationTypeMap,
    config: config
  });
  generatedTypeMap = buildRelationshipMutationPropertyInputType({
    mutationAction: mutationAction,
    outputType: outputType,
    propertyInputValues: propertyInputValues,
    generatedTypeMap: generatedTypeMap
  });
  generatedTypeMap = buildRelationshipMutationOutputType({
    mutationAction: mutationAction,
    mutationOutputType: mutationOutputType,
    propertyInputValues: propertyInputValues,
    propertyOutputFields: propertyOutputFields,
    relationshipName: relationshipName,
    fromType: fromType,
    toType: toType,
    generatedTypeMap: generatedTypeMap
  });
  return [operationTypeMap, generatedTypeMap];
};
/**
 * Builds the AST definition for a Mutation operation field
 * of a given RelationshipMutation name
 */


var buildRelationshipMutationField = function buildRelationshipMutationField(_ref4) {
  var mutationAction = _ref4.mutationAction,
      mutationName = _ref4.mutationName,
      relationshipName = _ref4.relationshipName,
      fromType = _ref4.fromType,
      toType = _ref4.toType,
      propertyInputValues = _ref4.propertyInputValues,
      propertyOutputFields = _ref4.propertyOutputFields,
      mutationOutputType = _ref4.mutationOutputType,
      outputType = _ref4.outputType,
      operationTypeMap = _ref4.operationTypeMap,
      config = _ref4.config;

  if (mutationAction === RelationshipMutation.CREATE || mutationAction === RelationshipMutation.DELETE || mutationAction === RelationshipMutation.UPDATE && propertyInputValues.length || mutationAction === RelationshipMutation.MERGE) {
    operationTypeMap[_types.OperationType.MUTATION].fields.push((0, _ast.buildField)({
      name: (0, _ast.buildName)({
        name: mutationName
      }),
      type: (0, _ast.buildNamedType)({
        name: mutationOutputType
      }),
      args: buildRelationshipMutationArguments({
        mutationAction: mutationAction,
        fromType: fromType,
        toType: toType,
        propertyOutputFields: propertyOutputFields,
        outputType: outputType
      }),
      directives: buildRelationshipMutationDirectives({
        mutationAction: mutationAction,
        relationshipName: relationshipName,
        fromType: fromType,
        toType: toType,
        config: config
      })
    }));
  }

  return operationTypeMap;
};
/**
 * Given the use of a relationship type field, builds the AST
 * for the input value definition of the 'data' argument for its 'Add'
 * relationship mutation field, which inputs a generated input object
 * type for providing relationship properties
 */


var buildRelationshipPropertyInputArgument = function buildRelationshipPropertyInputArgument(_ref5) {
  var outputType = _ref5.outputType;
  return (0, _ast.buildInputValue)({
    name: (0, _ast.buildName)({
      name: 'data'
    }),
    type: (0, _ast.buildNamedType)({
      name: "_".concat(outputType, "Input"),
      wrappers: (0, _defineProperty3["default"])({}, _fields.TypeWrappers.NON_NULL_NAMED_TYPE, true)
    })
  });
};
/**
 * Builds the AST for the relationship type property input
 * object definition, used as the type of the 'data' input value
 * definition built by buildRelationshipPropertyInputArgument
 */


var buildRelationshipMutationPropertyInputType = function buildRelationshipMutationPropertyInputType(_ref6) {
  var mutationAction = _ref6.mutationAction,
      outputType = _ref6.outputType,
      propertyInputValues = _ref6.propertyInputValues,
      generatedTypeMap = _ref6.generatedTypeMap;

  if ((mutationAction === RelationshipMutation.CREATE || mutationAction === RelationshipMutation.UPDATE || mutationAction === RelationshipMutation.MERGE) && propertyInputValues.length) {
    var nonComputedPropertyInputFields = propertyInputValues.filter(function (field) {
      var cypherDirective = (0, _directives.getDirective)({
        directives: field.directives,
        name: _directives.DirectiveDefinition.CYPHER
      });
      return !cypherDirective;
    });
    var inputTypeName = "_".concat(outputType, "Input");
    generatedTypeMap[inputTypeName] = (0, _ast.buildInputObjectType)({
      name: (0, _ast.buildName)({
        name: inputTypeName
      }),
      fields: nonComputedPropertyInputFields.map(function (inputValue) {
        return (0, _ast.buildInputValue)({
          name: (0, _ast.buildName)({
            name: inputValue.name
          }),
          type: (0, _ast.buildNamedType)(inputValue.type)
        });
      })
    });
  }

  return generatedTypeMap;
};
/**
 * Builds the AST for the input value definitions used as arguments on
 * generated relationship Mutation fields of RelationshipMutation names
 */


var buildRelationshipMutationArguments = function buildRelationshipMutationArguments(_ref7) {
  var mutationAction = _ref7.mutationAction,
      fromType = _ref7.fromType,
      toType = _ref7.toType,
      propertyOutputFields = _ref7.propertyOutputFields,
      outputType = _ref7.outputType;
  var fieldArguments = buildNodeSelectionArguments({
    fromType: fromType,
    toType: toType
  });

  if ((mutationAction === RelationshipMutation.CREATE || mutationAction === RelationshipMutation.UPDATE || mutationAction === RelationshipMutation.MERGE) && propertyOutputFields.length) {
    fieldArguments.push(buildRelationshipPropertyInputArgument({
      outputType: outputType
    }));
  }

  return fieldArguments;
};
/**
 * Builds the AST definitions for directive instances used by
 * generated relationship Mutation fields of RelationshipMutation
 * names
 */


var buildRelationshipMutationDirectives = function buildRelationshipMutationDirectives(_ref8) {
  var mutationAction = _ref8.mutationAction,
      relationshipName = _ref8.relationshipName,
      fromType = _ref8.fromType,
      toType = _ref8.toType,
      config = _ref8.config;
  var mutationMetaDirective = (0, _directives.buildMutationMetaDirective)({
    relationshipName: relationshipName,
    fromType: fromType,
    toType: toType
  });
  var directives = [mutationMetaDirective];

  if ((0, _directives.useAuthDirective)(config, _directives.DirectiveDefinition.HAS_SCOPE)) {
    var authAction = '';

    if (mutationAction === RelationshipMutation.CREATE) {
      authAction = 'Create';
    } else if (mutationAction === RelationshipMutation.DELETE) {
      authAction = 'Delete';
    } else if (mutationAction === RelationshipMutation.UPDATE) {
      authAction = 'Update';
    } else if (mutationAction === RelationshipMutation.MERGE) {
      authAction = 'Merge';
    }

    if (authAction) {
      directives.push((0, _directives.buildAuthScopeDirective)({
        scopes: [{
          typeName: fromType,
          mutation: authAction
        }, {
          typeName: toType,
          mutation: authAction
        }]
      }));
    }
  }

  return directives;
};
/**
 * Builds the AST for the object type definition used for the
 * output type of relationship type Mutation fields
 */


var buildRelationshipMutationOutputType = function buildRelationshipMutationOutputType(_ref9) {
  var mutationAction = _ref9.mutationAction,
      mutationOutputType = _ref9.mutationOutputType,
      propertyInputValues = _ref9.propertyInputValues,
      propertyOutputFields = _ref9.propertyOutputFields,
      relationshipName = _ref9.relationshipName,
      fromType = _ref9.fromType,
      toType = _ref9.toType,
      generatedTypeMap = _ref9.generatedTypeMap;

  if (mutationAction === RelationshipMutation.CREATE || mutationAction === RelationshipMutation.DELETE || mutationAction === RelationshipMutation.MERGE || mutationAction === RelationshipMutation.UPDATE && propertyInputValues.length) {
    var relationTypeDirective = (0, _directives.buildRelationDirective)({
      relationshipName: relationshipName,
      fromType: fromType,
      toType: toType
    });
    var fields = (0, _query.buildNodeOutputFields)({
      fromType: fromType,
      toType: toType
    });

    if (mutationAction === RelationshipMutation.CREATE || mutationAction === RelationshipMutation.UPDATE || mutationAction === RelationshipMutation.MERGE) {
      // TODO temporary block on cypher field arguments - needs translation test
      var mutationOutputFields = propertyOutputFields.map(function (field) {
        if ((0, _directives.isCypherField)({
          directives: field.directives
        })) {
          return _objectSpread({}, field, {
            arguments: []
          });
        } else return field;
      });
      fields.push.apply(fields, (0, _toConsumableArray2["default"])(mutationOutputFields));
    } // Overwrite


    generatedTypeMap[mutationOutputType] = (0, _ast.buildObjectType)({
      name: (0, _ast.buildName)({
        name: mutationOutputType
      }),
      fields: fields,
      directives: [relationTypeDirective]
    });
  }

  return generatedTypeMap;
};
/**
 * Builds the full name value for a relationship mutation field
 */


var buildRelationshipMutationName = function buildRelationshipMutationName(_ref10) {
  var mutationAction = _ref10.mutationAction,
      typeName = _ref10.typeName,
      fieldName = _ref10.fieldName;
  return "".concat(mutationAction).concat(typeName).concat(fieldName[0].toUpperCase() + fieldName.substr(1));
};