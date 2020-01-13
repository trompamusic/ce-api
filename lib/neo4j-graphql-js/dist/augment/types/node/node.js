"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs2/helpers/interopRequireDefault");

var _Object$defineProperty2 = require("@babel/runtime-corejs2/core-js/object/define-property");

_Object$defineProperty2(exports, "__esModule", {
  value: true
});

exports.augmentNodeTypeFields = exports.augmentNodeType = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/define-property"));

var _defineProperties = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/define-properties"));

var _getOwnPropertyDescriptors = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/get-own-property-descriptors"));

var _getOwnPropertyDescriptor = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/get-own-property-descriptor"));

var _getOwnPropertySymbols = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/get-own-property-symbols"));

var _keys = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/keys"));

var _defineProperty3 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/defineProperty"));

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/slicedToArray"));

var _query = require("./query");

var _mutation = require("./mutation");

var _relationship = require("../relationship/relationship");

var _mutation2 = require("../relationship/mutation");

var _augment = require("../../augment");

var _fields = require("../../fields");

var _inputValues = require("../../input-values");

var _directives = require("../../directives");

var _ast = require("../../ast");

var _types = require("../../types/types");

var _utils = require("../../../utils");

function ownKeys(object, enumerableOnly) { var keys = (0, _keys["default"])(object); if (_getOwnPropertySymbols["default"]) { var symbols = (0, _getOwnPropertySymbols["default"])(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return (0, _getOwnPropertyDescriptor["default"])(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty3["default"])(target, key, source[key]); }); } else if (_getOwnPropertyDescriptors["default"]) { (0, _defineProperties["default"])(target, (0, _getOwnPropertyDescriptors["default"])(source)); } else { ownKeys(Object(source)).forEach(function (key) { (0, _defineProperty2["default"])(target, key, (0, _getOwnPropertyDescriptor["default"])(source, key)); }); } } return target; }

/**
 * The main export for the augmentation process of a GraphQL
 * type definition representing a Neo4j node entity
 */
var augmentNodeType = function augmentNodeType(_ref) {
  var typeName = _ref.typeName,
      definition = _ref.definition,
      typeDefinitionMap = _ref.typeDefinitionMap,
      generatedTypeMap = _ref.generatedTypeMap,
      operationTypeMap = _ref.operationTypeMap,
      config = _ref.config;

  if ((0, _types.isObjectTypeDefinition)({
    definition: definition
  }) || (0, _types.isInterfaceTypeDefinition)({
    definition: definition
  })) {
    var _augmentNodeTypeField = augmentNodeTypeFields({
      typeName: typeName,
      definition: definition,
      typeDefinitionMap: typeDefinitionMap,
      generatedTypeMap: generatedTypeMap,
      operationTypeMap: operationTypeMap,
      config: config
    }),
        _augmentNodeTypeField2 = (0, _slicedToArray2["default"])(_augmentNodeTypeField, 4),
        nodeInputTypeMap = _augmentNodeTypeField2[0],
        propertyOutputFields = _augmentNodeTypeField2[1],
        propertyInputValues = _augmentNodeTypeField2[2],
        isIgnoredType = _augmentNodeTypeField2[3]; // A type is ignored when all its fields use @neo4j_ignore


    if (!isIgnoredType) {
      if (!(0, _types.isOperationTypeDefinition)({
        definition: definition,
        operationTypeMap: operationTypeMap
      }) && !(0, _types.isInterfaceTypeDefinition)({
        definition: definition
      })) {
        var _buildNeo4jSystemIDFi = (0, _fields.buildNeo4jSystemIDField)({
          definition: definition,
          typeName: typeName,
          propertyOutputFields: propertyOutputFields,
          operationTypeMap: operationTypeMap,
          nodeInputTypeMap: nodeInputTypeMap,
          config: config
        });

        var _buildNeo4jSystemIDFi2 = (0, _slicedToArray2["default"])(_buildNeo4jSystemIDFi, 2);

        propertyOutputFields = _buildNeo4jSystemIDFi2[0];
        nodeInputTypeMap = _buildNeo4jSystemIDFi2[1];
      }

      var _augmentNodeTypeAPI = augmentNodeTypeAPI({
        definition: definition,
        typeName: typeName,
        propertyOutputFields: propertyOutputFields,
        propertyInputValues: propertyInputValues,
        nodeInputTypeMap: nodeInputTypeMap,
        typeDefinitionMap: typeDefinitionMap,
        generatedTypeMap: generatedTypeMap,
        operationTypeMap: operationTypeMap,
        config: config
      });

      var _augmentNodeTypeAPI2 = (0, _slicedToArray2["default"])(_augmentNodeTypeAPI, 4);

      propertyOutputFields = _augmentNodeTypeAPI2[0];
      typeDefinitionMap = _augmentNodeTypeAPI2[1];
      generatedTypeMap = _augmentNodeTypeAPI2[2];
      operationTypeMap = _augmentNodeTypeAPI2[3];
      definition.fields = propertyOutputFields;
    }
  }

  return [definition, generatedTypeMap, operationTypeMap];
};
/**
 * Iterates through all field definitions of a node type, deciding whether
 * to generate the corresponding field or input value definitions that compose
 * the output and input types used in the Query and Mutation API
 */


exports.augmentNodeType = augmentNodeType;

var augmentNodeTypeFields = function augmentNodeTypeFields(_ref2) {
  var typeName = _ref2.typeName,
      definition = _ref2.definition,
      typeDefinitionMap = _ref2.typeDefinitionMap,
      generatedTypeMap = _ref2.generatedTypeMap,
      operationTypeMap = _ref2.operationTypeMap,
      config = _ref2.config;
  var fields = definition.fields;
  var isIgnoredType = true;
  var propertyInputValues = [];
  var nodeInputTypeMap = {};

  if (!(0, _types.isQueryTypeDefinition)({
    definition: definition,
    operationTypeMap: operationTypeMap
  })) {
    nodeInputTypeMap[_inputValues.FilteringArgument.FILTER] = {
      name: "_".concat(typeName, "Filter"),
      fields: []
    };
    nodeInputTypeMap[_inputValues.OrderingArgument.ORDER_BY] = {
      name: "_".concat(typeName, "Ordering"),
      values: []
    };
  }

  var propertyOutputFields = fields.reduce(function (outputFields, field) {
    var fieldType = field.type;
    var fieldArguments = field.arguments;
    var fieldDirectives = field.directives;

    if (!(0, _directives.isIgnoredField)({
      directives: fieldDirectives
    })) {
      isIgnoredType = false;
      var fieldName = field.name.value;
      var unwrappedType = (0, _fields.unwrapNamedType)({
        type: fieldType
      });
      var outputType = unwrappedType.name;
      var outputDefinition = typeDefinitionMap[outputType];
      var outputKind = outputDefinition ? outputDefinition.kind : '';
      var outputTypeWrappers = unwrappedType.wrappers;
      var relationshipDirective = (0, _directives.getDirective)({
        directives: fieldDirectives,
        name: _directives.DirectiveDefinition.RELATION
      });

      if ((0, _fields.isPropertyTypeField)({
        kind: outputKind,
        type: outputType
      })) {
        nodeInputTypeMap = (0, _inputValues.augmentInputTypePropertyFields)({
          inputTypeMap: nodeInputTypeMap,
          fieldName: fieldName,
          fieldDirectives: fieldDirectives,
          outputType: outputType,
          outputKind: outputKind,
          outputTypeWrappers: outputTypeWrappers
        });
        propertyInputValues.push({
          name: fieldName,
          type: unwrappedType,
          directives: fieldDirectives
        });
      } else if ((0, _types.isNodeType)({
        definition: outputDefinition
      })) {
        var _augmentNodeTypeField3 = augmentNodeTypeField({
          typeName: typeName,
          definition: definition,
          fieldArguments: fieldArguments,
          fieldDirectives: fieldDirectives,
          fieldName: fieldName,
          outputType: outputType,
          nodeInputTypeMap: nodeInputTypeMap,
          typeDefinitionMap: typeDefinitionMap,
          generatedTypeMap: generatedTypeMap,
          operationTypeMap: operationTypeMap,
          config: config,
          relationshipDirective: relationshipDirective,
          outputTypeWrappers: outputTypeWrappers
        });

        var _augmentNodeTypeField4 = (0, _slicedToArray2["default"])(_augmentNodeTypeField3, 5);

        fieldArguments = _augmentNodeTypeField4[0];
        nodeInputTypeMap = _augmentNodeTypeField4[1];
        typeDefinitionMap = _augmentNodeTypeField4[2];
        generatedTypeMap = _augmentNodeTypeField4[3];
        operationTypeMap = _augmentNodeTypeField4[4];
      } else if ((0, _types.isRelationshipType)({
        definition: outputDefinition
      })) {
        var _augmentRelationshipT = (0, _relationship.augmentRelationshipTypeField)({
          typeName: typeName,
          definition: definition,
          fieldType: fieldType,
          fieldArguments: fieldArguments,
          fieldDirectives: fieldDirectives,
          fieldName: fieldName,
          outputTypeWrappers: outputTypeWrappers,
          outputType: outputType,
          outputDefinition: outputDefinition,
          nodeInputTypeMap: nodeInputTypeMap,
          typeDefinitionMap: typeDefinitionMap,
          generatedTypeMap: generatedTypeMap,
          operationTypeMap: operationTypeMap,
          config: config
        });

        var _augmentRelationshipT2 = (0, _slicedToArray2["default"])(_augmentRelationshipT, 6);

        fieldType = _augmentRelationshipT2[0];
        fieldArguments = _augmentRelationshipT2[1];
        nodeInputTypeMap = _augmentRelationshipT2[2];
        typeDefinitionMap = _augmentRelationshipT2[3];
        generatedTypeMap = _augmentRelationshipT2[4];
        operationTypeMap = _augmentRelationshipT2[5];
      }
    }

    outputFields.push(_objectSpread({}, field, {
      type: fieldType,
      arguments: fieldArguments
    }));
    return outputFields;
  }, []);
  return [nodeInputTypeMap, propertyOutputFields, propertyInputValues, isIgnoredType];
};
/**
 * Builds the Query API field arguments and relationship field mutation
 * API for a node type field
 */


exports.augmentNodeTypeFields = augmentNodeTypeFields;

var augmentNodeTypeField = function augmentNodeTypeField(_ref3) {
  var typeName = _ref3.typeName,
      definition = _ref3.definition,
      fieldArguments = _ref3.fieldArguments,
      fieldDirectives = _ref3.fieldDirectives,
      fieldName = _ref3.fieldName,
      outputType = _ref3.outputType,
      nodeInputTypeMap = _ref3.nodeInputTypeMap,
      typeDefinitionMap = _ref3.typeDefinitionMap,
      generatedTypeMap = _ref3.generatedTypeMap,
      operationTypeMap = _ref3.operationTypeMap,
      config = _ref3.config,
      relationshipDirective = _ref3.relationshipDirective,
      outputTypeWrappers = _ref3.outputTypeWrappers;
  fieldArguments = (0, _query.augmentNodeTypeFieldArguments)({
    fieldArguments: fieldArguments,
    fieldDirectives: fieldDirectives,
    outputType: outputType,
    outputTypeWrappers: outputTypeWrappers,
    typeDefinitionMap: typeDefinitionMap,
    config: config
  });

  if (relationshipDirective && !(0, _types.isQueryTypeDefinition)({
    definition: definition,
    operationTypeMap: operationTypeMap
  })) {
    nodeInputTypeMap = (0, _query.augmentNodeQueryArgumentTypes)({
      typeName: typeName,
      fieldName: fieldName,
      outputType: outputType,
      outputTypeWrappers: outputTypeWrappers,
      nodeInputTypeMap: nodeInputTypeMap,
      config: config
    });
    var relationshipName = (0, _directives.getRelationName)(relationshipDirective);
    var relationshipDirection = (0, _directives.getRelationDirection)(relationshipDirective); // Assume direction OUT

    var fromType = typeName;
    var toType = outputType;

    if (relationshipDirection === 'IN') {
      var temp = fromType;
      fromType = outputType;
      toType = temp;
    }

    var _augmentRelationshipM = (0, _mutation2.augmentRelationshipMutationAPI)({
      typeName: typeName,
      fieldName: fieldName,
      outputType: outputType,
      fromType: fromType,
      toType: toType,
      relationshipName: relationshipName,
      typeDefinitionMap: typeDefinitionMap,
      generatedTypeMap: generatedTypeMap,
      operationTypeMap: operationTypeMap,
      config: config
    });

    var _augmentRelationshipM2 = (0, _slicedToArray2["default"])(_augmentRelationshipM, 3);

    typeDefinitionMap = _augmentRelationshipM2[0];
    generatedTypeMap = _augmentRelationshipM2[1];
    operationTypeMap = _augmentRelationshipM2[2];
  }

  return [fieldArguments, nodeInputTypeMap, typeDefinitionMap, generatedTypeMap, operationTypeMap];
};
/**
 * Uses the results of augmentNodeTypeFields to build the AST definitions
 * used to in supporting the Query and Mutation API of a node type
 */


var augmentNodeTypeAPI = function augmentNodeTypeAPI(_ref4) {
  var definition = _ref4.definition,
      typeName = _ref4.typeName,
      propertyOutputFields = _ref4.propertyOutputFields,
      propertyInputValues = _ref4.propertyInputValues,
      nodeInputTypeMap = _ref4.nodeInputTypeMap,
      typeDefinitionMap = _ref4.typeDefinitionMap,
      generatedTypeMap = _ref4.generatedTypeMap,
      operationTypeMap = _ref4.operationTypeMap,
      config = _ref4.config;

  var _augmentNodeMutationA = (0, _mutation.augmentNodeMutationAPI)({
    definition: definition,
    typeName: typeName,
    propertyInputValues: propertyInputValues,
    generatedTypeMap: generatedTypeMap,
    operationTypeMap: operationTypeMap,
    config: config
  });

  var _augmentNodeMutationA2 = (0, _slicedToArray2["default"])(_augmentNodeMutationA, 2);

  operationTypeMap = _augmentNodeMutationA2[0];
  generatedTypeMap = _augmentNodeMutationA2[1];

  var _augmentNodeQueryAPI = (0, _query.augmentNodeQueryAPI)({
    typeName: typeName,
    propertyInputValues: propertyInputValues,
    nodeInputTypeMap: nodeInputTypeMap,
    typeDefinitionMap: typeDefinitionMap,
    generatedTypeMap: generatedTypeMap,
    operationTypeMap: operationTypeMap,
    config: config
  });

  var _augmentNodeQueryAPI2 = (0, _slicedToArray2["default"])(_augmentNodeQueryAPI, 2);

  operationTypeMap = _augmentNodeQueryAPI2[0];
  generatedTypeMap = _augmentNodeQueryAPI2[1];
  generatedTypeMap = buildNodeSelectionInputType({
    definition: definition,
    typeName: typeName,
    propertyInputValues: propertyInputValues,
    generatedTypeMap: generatedTypeMap,
    config: config
  });
  return [propertyOutputFields, typeDefinitionMap, generatedTypeMap, operationTypeMap];
};
/**
 * Builds the AST definition of the node input object type used
 * by relationship mutations for selecting the nodes of the
 * relationship
 */


var buildNodeSelectionInputType = function buildNodeSelectionInputType(_ref5) {
  var definition = _ref5.definition,
      typeName = _ref5.typeName,
      propertyInputValues = _ref5.propertyInputValues,
      generatedTypeMap = _ref5.generatedTypeMap,
      config = _ref5.config;
  var mutationTypeName = _types.OperationType.MUTATION;
  var mutationTypeNameLower = mutationTypeName.toLowerCase();

  if ((0, _augment.shouldAugmentType)(config, mutationTypeNameLower, typeName)) {
    var primaryKey = (0, _utils.getPrimaryKey)(definition);
    var propertyInputName = "_".concat(typeName, "Input");

    if (primaryKey) {
      var primaryKeyName = primaryKey.name.value;
      var primaryKeyInputConfig = propertyInputValues.find(function (field) {
        return field.name === primaryKeyName;
      });

      if (primaryKeyInputConfig) {
        generatedTypeMap[propertyInputName] = (0, _ast.buildInputObjectType)({
          name: (0, _ast.buildName)({
            name: propertyInputName
          }),
          fields: [(0, _ast.buildInputValue)({
            name: (0, _ast.buildName)({
              name: primaryKeyName
            }),
            type: (0, _ast.buildNamedType)({
              name: primaryKeyInputConfig.type.name,
              wrappers: (0, _defineProperty3["default"])({}, _fields.TypeWrappers.NON_NULL_NAMED_TYPE, true)
            })
          })]
        });
      }
    }
  }

  return generatedTypeMap;
};