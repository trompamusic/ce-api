"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs2/helpers/interopRequireDefault");

var _Object$defineProperty2 = require("@babel/runtime-corejs2/core-js/object/define-property");

_Object$defineProperty2(exports, "__esModule", {
  value: true
});

exports.augmentNodeQueryArgumentTypes = exports.augmentNodeTypeFieldArguments = exports.augmentNodeQueryAPI = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/define-property"));

var _defineProperties = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/define-properties"));

var _getOwnPropertyDescriptors = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/get-own-property-descriptors"));

var _getOwnPropertyDescriptor = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/get-own-property-descriptor"));

var _getOwnPropertySymbols = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/get-own-property-symbols"));

var _keys = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/keys"));

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/toConsumableArray"));

var _defineProperty3 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/defineProperty"));

var _graphql = require("graphql");

var _query = require("../relationship/query");

var _ast = require("../../ast");

var _directives = require("../../directives");

var _augment = require("../../augment");

var _types = require("../../types/types");

var _fields = require("../../fields");

var _inputValues = require("../../input-values");

function ownKeys(object, enumerableOnly) { var keys = (0, _keys["default"])(object); if (_getOwnPropertySymbols["default"]) { var symbols = (0, _getOwnPropertySymbols["default"])(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return (0, _getOwnPropertyDescriptor["default"])(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty3["default"])(target, key, source[key]); }); } else if (_getOwnPropertyDescriptors["default"]) { (0, _defineProperties["default"])(target, (0, _getOwnPropertyDescriptors["default"])(source)); } else { ownKeys(Object(source)).forEach(function (key) { (0, _defineProperty2["default"])(target, key, (0, _getOwnPropertyDescriptor["default"])(source, key)); }); } } return target; }

/**
 * An enum describing which arguments are implemented for
 * node type fields in the Query API
 */
var NodeQueryArgument = _objectSpread({}, _inputValues.PagingArgument, {}, _inputValues.OrderingArgument, {}, _inputValues.FilteringArgument);
/**
 * Given the results of augmentNodeTypeFields, builds or augments
 * the AST definition of the Query operation field and any
 * generated input or output types required for translation
 */


var augmentNodeQueryAPI = function augmentNodeQueryAPI(_ref) {
  var typeName = _ref.typeName,
      propertyInputValues = _ref.propertyInputValues,
      nodeInputTypeMap = _ref.nodeInputTypeMap,
      typeDefinitionMap = _ref.typeDefinitionMap,
      generatedTypeMap = _ref.generatedTypeMap,
      operationTypeMap = _ref.operationTypeMap,
      config = _ref.config;
  var queryType = operationTypeMap[_types.OperationType.QUERY];

  var queryTypeNameLower = _types.OperationType.QUERY.toLowerCase();

  if ((0, _augment.shouldAugmentType)(config, queryTypeNameLower, typeName)) {
    if (queryType) {
      operationTypeMap = buildNodeQueryField({
        typeName: typeName,
        queryType: queryType,
        propertyInputValues: propertyInputValues,
        operationTypeMap: operationTypeMap,
        typeDefinitionMap: typeDefinitionMap,
        config: config
      });
    }

    generatedTypeMap = (0, _inputValues.buildQueryOrderingEnumType)({
      nodeInputTypeMap: nodeInputTypeMap,
      typeDefinitionMap: typeDefinitionMap,
      generatedTypeMap: generatedTypeMap
    });
    generatedTypeMap = (0, _inputValues.buildQueryFilteringInputType)({
      typeName: "_".concat(typeName, "Filter"),
      typeDefinitionMap: typeDefinitionMap,
      generatedTypeMap: generatedTypeMap,
      inputTypeMap: nodeInputTypeMap
    });
  }

  return [operationTypeMap, generatedTypeMap];
};
/**
 * Builds the AST for the input value definitions used for
 * node type Query field arguments
 */


exports.augmentNodeQueryAPI = augmentNodeQueryAPI;

var augmentNodeTypeFieldArguments = function augmentNodeTypeFieldArguments(_ref2) {
  var fieldArguments = _ref2.fieldArguments,
      fieldDirectives = _ref2.fieldDirectives,
      outputType = _ref2.outputType,
      outputTypeWrappers = _ref2.outputTypeWrappers,
      typeDefinitionMap = _ref2.typeDefinitionMap,
      config = _ref2.config;

  var queryTypeNameLower = _types.OperationType.QUERY.toLowerCase();

  if ((0, _augment.shouldAugmentType)(config, queryTypeNameLower, outputType)) {
    fieldArguments = (0, _inputValues.buildQueryFieldArguments)({
      argumentMap: NodeQueryArgument,
      fieldArguments: fieldArguments,
      fieldDirectives: fieldDirectives,
      outputType: outputType,
      outputTypeWrappers: outputTypeWrappers,
      typeDefinitionMap: typeDefinitionMap
    });
  }

  return fieldArguments;
};
/**
 * Given information about a field on a node type, builds the AST
 * for associated input value definitions used by input types
 * generated for the Query API
 */


exports.augmentNodeTypeFieldArguments = augmentNodeTypeFieldArguments;

var augmentNodeQueryArgumentTypes = function augmentNodeQueryArgumentTypes(_ref3) {
  var typeName = _ref3.typeName,
      fieldName = _ref3.fieldName,
      outputType = _ref3.outputType,
      outputTypeWrappers = _ref3.outputTypeWrappers,
      nodeInputTypeMap = _ref3.nodeInputTypeMap,
      config = _ref3.config;

  var queryTypeNameLower = _types.OperationType.QUERY.toLowerCase();

  if ((0, _augment.shouldAugmentType)(config, queryTypeNameLower, outputType)) {
    var _nodeInputTypeMap$Fil;

    (_nodeInputTypeMap$Fil = nodeInputTypeMap[_inputValues.FilteringArgument.FILTER].fields).push.apply(_nodeInputTypeMap$Fil, (0, _toConsumableArray2["default"])((0, _query.buildRelationshipFilters)({
      typeName: typeName,
      fieldName: fieldName,
      outputType: "_".concat(outputType, "Filter"),
      relatedType: outputType,
      outputTypeWrappers: outputTypeWrappers,
      config: config
    })));
  }

  return nodeInputTypeMap;
};
/**
 * Builds the AST for the Query type field definition for
 * a given node type
 */


exports.augmentNodeQueryArgumentTypes = augmentNodeQueryArgumentTypes;

var buildNodeQueryField = function buildNodeQueryField(_ref4) {
  var typeName = _ref4.typeName,
      queryType = _ref4.queryType,
      propertyInputValues = _ref4.propertyInputValues,
      operationTypeMap = _ref4.operationTypeMap,
      typeDefinitionMap = _ref4.typeDefinitionMap,
      config = _ref4.config;
  var queryFields = queryType.fields;

  if (!(0, _fields.getFieldDefinition)({
    fields: queryFields,
    name: typeName
  })) {
    queryFields.push((0, _ast.buildField)({
      name: (0, _ast.buildName)({
        name: typeName
      }),
      type: (0, _ast.buildNamedType)({
        name: typeName,
        wrappers: (0, _defineProperty3["default"])({}, _fields.TypeWrappers.LIST_TYPE, true)
      }),
      args: buildNodeQueryArguments({
        typeName: typeName,
        propertyInputValues: propertyInputValues,
        typeDefinitionMap: typeDefinitionMap
      }),
      directives: buildNodeQueryDirectives({
        typeName: typeName,
        config: config
      })
    }));
  }

  operationTypeMap[_types.OperationType.QUERY].fields = queryFields;
  return operationTypeMap;
};
/**
 * Builds the AST for input value definitions used for the
 * arguments of the Query type field for a given node type
 */


var buildNodeQueryArguments = function buildNodeQueryArguments(_ref5) {
  var typeName = _ref5.typeName,
      propertyInputValues = _ref5.propertyInputValues,
      typeDefinitionMap = _ref5.typeDefinitionMap;
  // Do not persist type wrappers
  propertyInputValues = propertyInputValues.map(function (arg) {
    return (0, _ast.buildInputValue)({
      name: (0, _ast.buildName)({
        name: arg.name
      }),
      type: (0, _ast.buildNamedType)({
        name: arg.type.name
      })
    });
  });

  if (!propertyInputValues.some(function (field) {
    return field.name.value === '_id';
  })) {
    propertyInputValues.push((0, _ast.buildInputValue)({
      name: (0, _ast.buildName)({
        name: '_id'
      }),
      type: (0, _ast.buildNamedType)({
        name: _graphql.GraphQLString.name
      })
    }));
  }

  propertyInputValues = (0, _inputValues.buildQueryFieldArguments)({
    argumentMap: NodeQueryArgument,
    fieldArguments: propertyInputValues,
    outputType: typeName,
    outputTypeWrappers: (0, _defineProperty3["default"])({}, _fields.TypeWrappers.LIST_TYPE, true),
    typeDefinitionMap: typeDefinitionMap
  });
  return propertyInputValues;
};
/**
 * Builds the AST for directive instances on the Query type
 * field for a given node type
 */


var buildNodeQueryDirectives = function buildNodeQueryDirectives(_ref6) {
  var typeName = _ref6.typeName,
      config = _ref6.config;
  var directives = [];

  if ((0, _directives.useAuthDirective)(config, _directives.DirectiveDefinition.HAS_SCOPE)) {
    directives.push((0, _directives.buildAuthScopeDirective)({
      scopes: [{
        typeName: typeName,
        mutation: "Read"
      }]
    }));
  }

  return directives;
};