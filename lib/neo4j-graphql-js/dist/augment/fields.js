"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs2/helpers/interopRequireDefault");

var _Object$defineProperty = require("@babel/runtime-corejs2/core-js/object/define-property");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.propertyFieldExists = exports.buildNeo4jSystemIDField = exports.toSnakeCase = exports.getFieldType = exports.getFieldDefinition = exports.unwrapNamedType = exports.isNonNullListTypeField = exports.isListTypeField = exports.isNonNullNamedTypeField = exports.TypeWrappers = exports.isCustomScalarField = exports.isNeo4jIDField = exports.isSpatialField = exports.isTemporalField = exports.isNeo4jTypeField = exports.isBooleanField = exports.isStringField = exports.isFloatField = exports.isIntegerField = exports.isPropertyTypeField = exports.Neo4jSystemIDField = void 0;

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/toConsumableArray"));

var _keys = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/keys"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/defineProperty"));

var _graphql = require("graphql");

var _augment = require("./augment");

var _types = require("./types/types");

var _inputValues = require("./input-values");

var _ast = require("./ast");

/**
 * The name of the Neo4j system ID field
 * See: https://neo4j.com/docs/cypher-manual/current/functions/scalar/#functions-id
 */
var Neo4jSystemIDField = "_id";
/**
 * Given the kind or type of a field, this predicate function identifies which
 * Neo4j property type, if any, it represents
 * See: https://neo4j.com/docs/cypher-manual/current/syntax/values/#property-types
 */

exports.Neo4jSystemIDField = Neo4jSystemIDField;

var isPropertyTypeField = function isPropertyTypeField(_ref) {
  var kind = _ref.kind,
      type = _ref.type;
  return isIntegerField({
    type: type
  }) || isFloatField({
    type: type
  }) || isStringField({
    kind: kind,
    type: type
  }) || isBooleanField({
    type: type
  }) || isCustomScalarField({
    kind: kind
  }) || isTemporalField({
    type: type
  }) || isSpatialField({
    type: type
  }) || (0, _types.isNeo4jPropertyType)({
    type: type
  });
};

exports.isPropertyTypeField = isPropertyTypeField;

var isIntegerField = function isIntegerField(_ref2) {
  var type = _ref2.type;
  return _types.Neo4jDataType.PROPERTY[type] === 'Integer';
};

exports.isIntegerField = isIntegerField;

var isFloatField = function isFloatField(_ref3) {
  var type = _ref3.type;
  return _types.Neo4jDataType.PROPERTY[type] === 'Float';
};

exports.isFloatField = isFloatField;

var isStringField = function isStringField(_ref4) {
  var kind = _ref4.kind,
      type = _ref4.type;
  return _types.Neo4jDataType.PROPERTY[kind] === 'String' || _types.Neo4jDataType.PROPERTY[type] === 'String';
};

exports.isStringField = isStringField;

var isBooleanField = function isBooleanField(_ref5) {
  var type = _ref5.type;
  return _types.Neo4jDataType.PROPERTY[type] === 'Boolean';
};

exports.isBooleanField = isBooleanField;

var isNeo4jTypeField = function isNeo4jTypeField(_ref6) {
  var type = _ref6.type;
  return isTemporalField({
    type: type
  }) || isSpatialField({
    type: type
  });
};

exports.isNeo4jTypeField = isNeo4jTypeField;

var isTemporalField = function isTemporalField(_ref7) {
  var type = _ref7.type;
  return _types.Neo4jDataType.PROPERTY[type] === 'Temporal';
};

exports.isTemporalField = isTemporalField;

var isSpatialField = function isSpatialField(_ref8) {
  var type = _ref8.type;
  return _types.Neo4jDataType.PROPERTY[type] === 'Spatial';
};

exports.isSpatialField = isSpatialField;

var isNeo4jIDField = function isNeo4jIDField(_ref9) {
  var name = _ref9.name;
  return name === Neo4jSystemIDField;
};

exports.isNeo4jIDField = isNeo4jIDField;

var isCustomScalarField = function isCustomScalarField(_ref10) {
  var kind = _ref10.kind;
  return kind === _graphql.Kind.SCALAR_TYPE_DEFINITION;
};
/**
 * An Enum used for referring to the unique combinations of GraphQL type wrappers
 */


exports.isCustomScalarField = isCustomScalarField;
var TypeWrappers = {
  NAME: 'name',
  NON_NULL_NAMED_TYPE: 'isNonNullNamedType',
  LIST_TYPE: 'isListType',
  NON_NULL_LIST_TYPE: 'isNonNullListType'
};
/**
 * Predicate function identifying whether a GraphQL NamedType
 * contained in a type was wrapped with a NonNullType wrapper
 */

exports.TypeWrappers = TypeWrappers;

var isNonNullNamedTypeField = function isNonNullNamedTypeField(_ref11) {
  var _ref11$wrappers = _ref11.wrappers,
      wrappers = _ref11$wrappers === void 0 ? {} : _ref11$wrappers;
  return wrappers[TypeWrappers.NON_NULL_NAMED_TYPE];
};
/**
 * Predicate function identifying whether a type was wrapped
 * with a GraphQL ListType wrapper
 */


exports.isNonNullNamedTypeField = isNonNullNamedTypeField;

var isListTypeField = function isListTypeField(_ref12) {
  var _ref12$wrappers = _ref12.wrappers,
      wrappers = _ref12$wrappers === void 0 ? {} : _ref12$wrappers;
  return wrappers[TypeWrappers.LIST_TYPE];
};
/**
 * Predicate function identifying whether a GraphQL ListType
 * contained in a type was wrapped with a NonNullType wrapper
 */


exports.isListTypeField = isListTypeField;

var isNonNullListTypeField = function isNonNullListTypeField(_ref13) {
  var _ref13$wrappers = _ref13.wrappers,
      wrappers = _ref13$wrappers === void 0 ? {} : _ref13$wrappers;
  return wrappers[TypeWrappers.NON_NULL_LIST_TYPE];
};
/**
 * A helper function that reduces the type wrappers of a given type
 * to unique cases described by the TypeWrappers enum. This enables the use
 * of simplified predicate functions for identifying type wrapper conditions,
 * as well as enables a configurable generative process for wrapping types,
 * using buildNamedType.
 * See: https://graphql.github.io/graphql-spec/June2018/#sec-Wrapping-Types
 */


exports.isNonNullListTypeField = isNonNullListTypeField;

var unwrapNamedType = function unwrapNamedType(_ref14) {
  var _unwrappedType$wrappe;

  var _ref14$type = _ref14.type,
      type = _ref14$type === void 0 ? {} : _ref14$type,
      _ref14$unwrappedType = _ref14.unwrappedType,
      unwrappedType = _ref14$unwrappedType === void 0 ? {} : _ref14$unwrappedType;
  // Initialize wrappers for this type
  unwrappedType.wrappers = (_unwrappedType$wrappe = {}, (0, _defineProperty2["default"])(_unwrappedType$wrappe, TypeWrappers.LIST_TYPE, false), (0, _defineProperty2["default"])(_unwrappedType$wrappe, TypeWrappers.NON_NULL_NAMED_TYPE, false), (0, _defineProperty2["default"])(_unwrappedType$wrappe, TypeWrappers.NON_NULL_LIST_TYPE, false), _unwrappedType$wrappe); // Get wrapped type

  var wrappedType = type.type; // Recursing down through all type wrappers:
  // See: https://graphql.github.io/graphql-spec/June2018/#sec-Type-References

  if (wrappedType) {
    unwrappedType = unwrapNamedType({
      type: wrappedType,
      unwrappedType: unwrappedType
    });
  } // Making decisions on the way back up:
  // Cases: (1) Name, (2) [Name], (3) [Name!], (4) Name!, (5) [Name]!, (6) [Name!]!


  if (type.kind === _graphql.Kind.NAMED_TYPE && type.name) {
    if (type.name.kind === _graphql.Kind.NAME) {
      // (1) Name - name of unwrapped type
      unwrappedType[TypeWrappers.NAME] = type.name.value;
    }
  } else if (type.kind === _graphql.Kind.LIST_TYPE) {
    // (2) [Name], (3) [Name!]
    unwrappedType.wrappers[TypeWrappers.LIST_TYPE] = true;
  } else if (type.kind === _graphql.Kind.NON_NULL_TYPE) {
    // Check the wrapped type; a name or a list
    if (wrappedType) {
      if (wrappedType.kind === _graphql.Kind.NAMED_TYPE) {
        // (4) Name!
        unwrappedType.wrappers[TypeWrappers.NON_NULL_NAMED_TYPE] = true;
      } else if (wrappedType.kind === _graphql.Kind.LIST_TYPE) {
        // (5) [Name]!, (6) [Name!]!
        unwrappedType.wrappers[TypeWrappers.NON_NULL_LIST_TYPE] = true;
      }
    }
  }

  return unwrappedType;
};
/**
 * A getter for a field definition of a given name, contained
 * in a given array of field definitions
 */


exports.unwrapNamedType = unwrapNamedType;

var getFieldDefinition = function getFieldDefinition(_ref15) {
  var _ref15$fields = _ref15.fields,
      fields = _ref15$fields === void 0 ? [] : _ref15$fields,
      _ref15$name = _ref15.name,
      name = _ref15$name === void 0 ? '' : _ref15$name;
  return fields.find(function (field) {
    return field.name && field.name.value === name;
  });
};
/**
 * A getter for the type name of a field of a given name,
 * finding the field, unwrapping its type, and returning
 * the value of its NamedType
 */


exports.getFieldDefinition = getFieldDefinition;

var getFieldType = function getFieldType(_ref16) {
  var _ref16$fields = _ref16.fields,
      fields = _ref16$fields === void 0 ? [] : _ref16$fields,
      _ref16$name = _ref16.name,
      name = _ref16$name === void 0 ? '' : _ref16$name;
  var typeName = '';
  var field = getFieldDefinition({
    fields: fields,
    name: name
  });

  if (field) {
    typeName = unwrapNamedType({
      type: field.type
    }).name;
  }

  return typeName;
};
/**
 * Transformation helper for conversion of a given string to
 * snake case, used in generating default relationship names
 * ex: fooBar -> FOO_BAR
 */


exports.getFieldType = getFieldType;

var toSnakeCase = function toSnakeCase(name) {
  return (0, _keys["default"])(name).reduce(function (acc, t) {
    var _char = name.charAt(t);

    var uppercased = _char.toUpperCase();

    if (_char === uppercased && t > 0) {
      acc.push("_".concat(uppercased));
    } else {
      acc.push(uppercased);
    }

    return acc;
  }, []).join('');
};
/**
 * Builds the AST definition for the Neo4j system ID, adding an
 * '_id' field to the fields of a given type and its associated API
 */


exports.toSnakeCase = toSnakeCase;

var buildNeo4jSystemIDField = function buildNeo4jSystemIDField(_ref17) {
  var typeName = _ref17.typeName,
      propertyOutputFields = _ref17.propertyOutputFields,
      nodeInputTypeMap = _ref17.nodeInputTypeMap,
      config = _ref17.config;

  var queryTypeNameLower = _types.OperationType.QUERY.toLowerCase();

  if ((0, _augment.shouldAugmentType)(config, queryTypeNameLower, typeName)) {
    var neo4jInternalIDConfig = {
      name: Neo4jSystemIDField,
      type: {
        name: _graphql.GraphQLString.name
      }
    };
    var systemIDIndex = propertyOutputFields.findIndex(function (e) {
      return e.name.value === Neo4jSystemIDField;
    });
    var systemIDField = (0, _ast.buildField)({
      name: (0, _ast.buildName)({
        name: neo4jInternalIDConfig.name
      }),
      type: (0, _ast.buildNamedType)({
        name: _graphql.GraphQLString.name
      })
    });

    if (systemIDIndex >= 0) {
      propertyOutputFields.splice(systemIDIndex, 1, systemIDField);
    } else {
      propertyOutputFields.push(systemIDField);
    }

    var orderingValues = nodeInputTypeMap[_inputValues.OrderingArgument.ORDER_BY].values;
    var systemIDOrderingValue = orderingValues.find(function (value) {
      return value.name.value === "".concat(Neo4jSystemIDField, "_asc") || value.name.value === "".concat(Neo4jSystemIDField, "_desc");
    });

    if (!systemIDOrderingValue) {
      var _nodeInputTypeMap$Ord;

      (_nodeInputTypeMap$Ord = nodeInputTypeMap[_inputValues.OrderingArgument.ORDER_BY].values).push.apply(_nodeInputTypeMap$Ord, (0, _toConsumableArray2["default"])((0, _inputValues.buildPropertyOrderingValues)({
        fieldName: neo4jInternalIDConfig.name
      })));
    }
  }

  return [propertyOutputFields, nodeInputTypeMap];
};

exports.buildNeo4jSystemIDField = buildNeo4jSystemIDField;

var propertyFieldExists = function propertyFieldExists(_ref18) {
  var _ref18$definition = _ref18.definition,
      definition = _ref18$definition === void 0 ? {} : _ref18$definition,
      _ref18$typeDefinition = _ref18.typeDefinitionMap,
      typeDefinitionMap = _ref18$typeDefinition === void 0 ? {} : _ref18$typeDefinition;
  var fields = definition.fields || [];
  return fields.find(function (field) {
    var fieldName = field.name.value;
    var fieldType = field.type;
    var unwrappedType = unwrapNamedType({
      type: fieldType
    });
    var outputType = unwrappedType.name;
    var outputDefinition = typeDefinitionMap[outputType];
    var outputKind = outputDefinition ? outputDefinition.kind : '';
    return isPropertyTypeField({
      kind: outputKind,
      type: outputType
    });
  });
};

exports.propertyFieldExists = propertyFieldExists;