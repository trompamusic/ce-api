"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs2/helpers/interopRequireDefault");

var _Object$defineProperty2 = require("@babel/runtime-corejs2/core-js/object/define-property");

_Object$defineProperty2(exports, "__esModule", {
  value: true
});

exports.buildNodeOutputFields = exports.buildRelationshipFilters = exports.augmentRelationshipQueryAPI = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/define-property"));

var _defineProperties = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/define-properties"));

var _getOwnPropertyDescriptors = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/get-own-property-descriptors"));

var _getOwnPropertyDescriptor = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/get-own-property-descriptor"));

var _getOwnPropertySymbols = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/get-own-property-symbols"));

var _keys = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/keys"));

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/toConsumableArray"));

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/slicedToArray"));

var _defineProperty3 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/defineProperty"));

var _relationship = require("./relationship");

var _augment = require("../../augment");

var _types = require("../../types/types");

var _fields = require("../../fields");

var _inputValues = require("../../input-values");

var _directives = require("../../directives");

var _ast = require("../../ast");

function ownKeys(object, enumerableOnly) { var keys = (0, _keys["default"])(object); if (_getOwnPropertySymbols["default"]) { var symbols = (0, _getOwnPropertySymbols["default"])(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return (0, _getOwnPropertyDescriptor["default"])(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty3["default"])(target, key, source[key]); }); } else if (_getOwnPropertyDescriptors["default"]) { (0, _defineProperties["default"])(target, (0, _getOwnPropertyDescriptors["default"])(source)); } else { ownKeys(Object(source)).forEach(function (key) { (0, _defineProperty2["default"])(target, key, (0, _getOwnPropertyDescriptor["default"])(source, key)); }); } } return target; }

/**
 * An enum describing which arguments are implemented for
 * relationship type fields in the Query API
 */
var RelationshipQueryArgument = _objectSpread({}, _inputValues.FilteringArgument);
/**
 * Given the results of augmentRelationshipTypeFields, builds or
 * augments the AST definition of the Query operation field and
 * any generated input or output types required for translation
 */


var augmentRelationshipQueryAPI = function augmentRelationshipQueryAPI(_ref) {
  var typeName = _ref.typeName,
      fieldArguments = _ref.fieldArguments,
      fieldName = _ref.fieldName,
      outputType = _ref.outputType,
      fromType = _ref.fromType,
      toType = _ref.toType,
      typeDefinitionMap = _ref.typeDefinitionMap,
      generatedTypeMap = _ref.generatedTypeMap,
      nodeInputTypeMap = _ref.nodeInputTypeMap,
      relationshipInputTypeMap = _ref.relationshipInputTypeMap,
      outputTypeWrappers = _ref.outputTypeWrappers,
      config = _ref.config,
      relationshipName = _ref.relationshipName,
      fieldType = _ref.fieldType,
      propertyOutputFields = _ref.propertyOutputFields;

  var queryTypeNameLower = _types.OperationType.QUERY.toLowerCase();

  if ((0, _augment.shouldAugmentRelationshipField)(config, queryTypeNameLower, fromType, toType)) {
    var relatedType = decideRelatedType({
      typeName: typeName,
      fromType: fromType,
      toType: toType
    });

    if (validateRelationTypeDirectedFields(typeName, fieldName, fromType, toType, outputType)) {
      var _transformRelationshi = transformRelationshipTypeFieldOutput({
        typeName: typeName,
        relatedType: relatedType,
        fieldArguments: fieldArguments,
        fieldName: fieldName,
        outputType: outputType,
        fromType: fromType,
        toType: toType,
        generatedTypeMap: generatedTypeMap,
        outputTypeWrappers: outputTypeWrappers,
        config: config,
        relationshipName: relationshipName,
        fieldType: fieldType,
        propertyOutputFields: propertyOutputFields
      });

      var _transformRelationshi2 = (0, _slicedToArray2["default"])(_transformRelationshi, 2);

      fieldType = _transformRelationshi2[0];
      generatedTypeMap = _transformRelationshi2[1];

      var _augmentRelationshipT = augmentRelationshipTypeFieldInput({
        typeName: typeName,
        relatedType: relatedType,
        fieldArguments: fieldArguments,
        fieldName: fieldName,
        outputType: outputType,
        fromType: fromType,
        toType: toType,
        typeDefinitionMap: typeDefinitionMap,
        generatedTypeMap: generatedTypeMap,
        nodeInputTypeMap: nodeInputTypeMap,
        relationshipInputTypeMap: relationshipInputTypeMap,
        outputTypeWrappers: outputTypeWrappers,
        config: config
      });

      var _augmentRelationshipT2 = (0, _slicedToArray2["default"])(_augmentRelationshipT, 3);

      fieldArguments = _augmentRelationshipT2[0];
      generatedTypeMap = _augmentRelationshipT2[1];
      nodeInputTypeMap = _augmentRelationshipT2[2];
    }
  }

  return [fieldType, fieldArguments, typeDefinitionMap, generatedTypeMap, nodeInputTypeMap];
};
/**
 * Given a relationship type field, builds the input value
 * definitions for its Query arguments, along with those needed
 * for input types generated to support the same Query API
 * for the given field of the given relationship type
 */


exports.augmentRelationshipQueryAPI = augmentRelationshipQueryAPI;

var augmentRelationshipTypeFieldInput = function augmentRelationshipTypeFieldInput(_ref2) {
  var typeName = _ref2.typeName,
      relatedType = _ref2.relatedType,
      fieldArguments = _ref2.fieldArguments,
      fieldName = _ref2.fieldName,
      outputType = _ref2.outputType,
      fromType = _ref2.fromType,
      toType = _ref2.toType,
      typeDefinitionMap = _ref2.typeDefinitionMap,
      generatedTypeMap = _ref2.generatedTypeMap,
      nodeInputTypeMap = _ref2.nodeInputTypeMap,
      relationshipInputTypeMap = _ref2.relationshipInputTypeMap,
      outputTypeWrappers = _ref2.outputTypeWrappers,
      config = _ref2.config;
  var nodeFilteringFields = nodeInputTypeMap[_inputValues.FilteringArgument.FILTER].fields;
  var relationshipFilterTypeName = "_".concat(typeName).concat(outputType[0].toUpperCase() + outputType.substr(1)); // Assume outgoing relationship

  if (fromType === toType) {
    relationshipFilterTypeName = "_".concat(outputType, "Directions");
  }

  nodeFilteringFields.push.apply(nodeFilteringFields, (0, _toConsumableArray2["default"])(buildRelationshipFilters({
    typeName: typeName,
    fieldName: fieldName,
    outputType: "".concat(relationshipFilterTypeName, "Filter"),
    relatedType: outputType,
    outputTypeWrappers: outputTypeWrappers,
    config: config
  })));

  var _augmentRelationshipT3 = augmentRelationshipTypeFieldArguments({
    fieldArguments: fieldArguments,
    typeName: typeName,
    fromType: fromType,
    toType: toType,
    outputType: outputType,
    relatedType: relatedType,
    relationshipFilterTypeName: relationshipFilterTypeName,
    outputTypeWrappers: outputTypeWrappers,
    typeDefinitionMap: typeDefinitionMap,
    generatedTypeMap: generatedTypeMap,
    relationshipInputTypeMap: relationshipInputTypeMap
  });

  var _augmentRelationshipT4 = (0, _slicedToArray2["default"])(_augmentRelationshipT3, 2);

  fieldArguments = _augmentRelationshipT4[0];
  generatedTypeMap = _augmentRelationshipT4[1];
  return [fieldArguments, generatedTypeMap, nodeInputTypeMap];
};
/**
 * Builds the AST for the input value definitions used for
 * relationship type Query field arguments
 */


var augmentRelationshipTypeFieldArguments = function augmentRelationshipTypeFieldArguments(_ref3) {
  var fieldArguments = _ref3.fieldArguments,
      typeName = _ref3.typeName,
      fromType = _ref3.fromType,
      toType = _ref3.toType,
      outputType = _ref3.outputType,
      relatedType = _ref3.relatedType,
      relationshipFilterTypeName = _ref3.relationshipFilterTypeName,
      outputTypeWrappers = _ref3.outputTypeWrappers,
      typeDefinitionMap = _ref3.typeDefinitionMap,
      generatedTypeMap = _ref3.generatedTypeMap,
      relationshipInputTypeMap = _ref3.relationshipInputTypeMap;

  if (fromType !== toType) {
    fieldArguments = (0, _inputValues.buildQueryFieldArguments)({
      argumentMap: RelationshipQueryArgument,
      fieldArguments: fieldArguments,
      outputType: "".concat(typeName).concat(outputType),
      outputTypeWrappers: outputTypeWrappers
    });
  } else {
    fieldArguments = [];
  }

  generatedTypeMap = buildRelationshipSelectionArgumentInputTypes({
    fromType: fromType,
    toType: toType,
    relatedType: relatedType,
    relationshipFilterTypeName: relationshipFilterTypeName,
    generatedTypeMap: generatedTypeMap,
    relationshipInputTypeMap: relationshipInputTypeMap,
    typeDefinitionMap: typeDefinitionMap
  });
  return [fieldArguments, generatedTypeMap];
};
/**
 * Builds the AST for object type definitions used for transforming
 * a relationship type field on a node type - will likely not be
 * necessary once we allow for dynamically named fields for the
 * 'from' and 'to' node type reference fields on relationship types
 */


var transformRelationshipTypeFieldOutput = function transformRelationshipTypeFieldOutput(_ref4) {
  var typeName = _ref4.typeName,
      relatedType = _ref4.relatedType,
      fieldArguments = _ref4.fieldArguments,
      fieldName = _ref4.fieldName,
      outputType = _ref4.outputType,
      fromType = _ref4.fromType,
      toType = _ref4.toType,
      generatedTypeMap = _ref4.generatedTypeMap,
      outputTypeWrappers = _ref4.outputTypeWrappers,
      relationshipName = _ref4.relationshipName,
      fieldType = _ref4.fieldType,
      propertyOutputFields = _ref4.propertyOutputFields;
  var relationshipOutputName = "_".concat(typeName).concat(fieldName[0].toUpperCase() + fieldName.substr(1));
  var unwrappedType = (0, _fields.unwrapNamedType)({
    type: fieldType
  });

  if (fromType === toType) {
    // Clear arguments on this field, given their distribution
    fieldType = (0, _ast.buildNamedType)({
      name: "".concat(relationshipOutputName, "Directions")
    });
  } else {
    // Output transform
    unwrappedType.name = relationshipOutputName;
    fieldType = (0, _ast.buildNamedType)(unwrappedType);
  }

  generatedTypeMap = buildRelationshipFieldOutputTypes({
    outputType: outputType,
    fromType: fromType,
    toType: toType,
    outputTypeWrappers: outputTypeWrappers,
    fieldArguments: fieldArguments,
    relationshipOutputName: relationshipOutputName,
    relationshipName: relationshipName,
    relatedType: relatedType,
    propertyOutputFields: propertyOutputFields,
    generatedTypeMap: generatedTypeMap
  });
  return [fieldType, generatedTypeMap];
};
/**
 * Builds the AST definitions that compose the Query filtering input type
 * values for a given relationship field
 */


var buildRelationshipFilters = function buildRelationshipFilters(_ref5) {
  var typeName = _ref5.typeName,
      fieldName = _ref5.fieldName,
      outputType = _ref5.outputType,
      relatedType = _ref5.relatedType,
      outputTypeWrappers = _ref5.outputTypeWrappers,
      config = _ref5.config;
  var filters = [];

  var queryTypeNameLower = _types.OperationType.QUERY.toLowerCase();

  if ((0, _augment.shouldAugmentRelationshipField)(config, queryTypeNameLower, typeName, relatedType)) {
    if ((0, _fields.isListTypeField)({
      wrappers: outputTypeWrappers
    })) {
      filters = (0, _inputValues.buildFilters)({
        fieldName: fieldName,
        fieldConfig: {
          name: fieldName,
          type: {
            name: outputType
          }
        },
        filterTypes: ['not', 'in', 'not_in', 'some', 'none', 'single', 'every']
      });
    } else {
      filters = (0, _inputValues.buildFilters)({
        fieldName: fieldName,
        fieldConfig: {
          name: fieldName,
          type: {
            name: outputType
          }
        },
        filterTypes: ['not', 'in', 'not_in']
      });
    }
  }

  return filters;
};
/**
 * Builds the AST definitions for the incoming and outgoing node type
 * fields of the output object types generated for querying relationship
 * type fields
 */


exports.buildRelationshipFilters = buildRelationshipFilters;

var buildNodeOutputFields = function buildNodeOutputFields(_ref6) {
  var fromType = _ref6.fromType,
      toType = _ref6.toType,
      _ref6$args = _ref6.args,
      args = _ref6$args === void 0 ? [] : _ref6$args,
      _ref6$wrappers = _ref6.wrappers,
      wrappers = _ref6$wrappers === void 0 ? {} : _ref6$wrappers;
  return [(0, _ast.buildField)({
    name: (0, _ast.buildName)({
      name: _relationship.RelationshipDirectionField.FROM
    }),
    args: args,
    type: (0, _ast.buildNamedType)({
      name: fromType,
      wrappers: wrappers
    })
  }), (0, _ast.buildField)({
    name: (0, _ast.buildName)({
      name: _relationship.RelationshipDirectionField.TO
    }),
    args: args,
    type: (0, _ast.buildNamedType)({
      name: toType,
      wrappers: wrappers
    })
  })];
};
/**
 * Builds the AST definitions for the object types generated
 * for querying relationship type fields on node types
 */


exports.buildNodeOutputFields = buildNodeOutputFields;

var buildRelationshipFieldOutputTypes = function buildRelationshipFieldOutputTypes(_ref7) {
  var outputType = _ref7.outputType,
      fromType = _ref7.fromType,
      toType = _ref7.toType,
      outputTypeWrappers = _ref7.outputTypeWrappers,
      fieldArguments = _ref7.fieldArguments,
      relationshipOutputName = _ref7.relationshipOutputName,
      relationshipName = _ref7.relationshipName,
      relatedType = _ref7.relatedType,
      propertyOutputFields = _ref7.propertyOutputFields,
      generatedTypeMap = _ref7.generatedTypeMap;
  var relationTypeDirective = (0, _directives.buildRelationDirective)({
    relationshipName: relationshipName,
    fromType: fromType,
    toType: toType
  });

  if (fromType === toType) {
    fieldArguments = (0, _inputValues.buildQueryFieldArguments)({
      argumentMap: RelationshipQueryArgument,
      fieldArguments: fieldArguments,
      outputType: outputType,
      outputTypeWrappers: outputTypeWrappers
    });
    var reflexiveOutputName = "".concat(relationshipOutputName, "Directions");
    generatedTypeMap[reflexiveOutputName] = (0, _ast.buildObjectType)({
      name: (0, _ast.buildName)({
        name: reflexiveOutputName
      }),
      fields: buildNodeOutputFields({
        fromType: relationshipOutputName,
        toType: relationshipOutputName,
        args: fieldArguments,
        wrappers: (0, _defineProperty3["default"])({}, _fields.TypeWrappers.LIST_TYPE, true)
      }),
      directives: [relationTypeDirective]
    });
  }

  generatedTypeMap[relationshipOutputName] = (0, _ast.buildObjectType)({
    name: (0, _ast.buildName)({
      name: relationshipOutputName
    }),
    fields: [].concat((0, _toConsumableArray2["default"])(propertyOutputFields), [(0, _ast.buildField)({
      name: (0, _ast.buildName)({
        name: relatedType
      }),
      type: (0, _ast.buildNamedType)({
        name: relatedType
      })
    })]),
    directives: [relationTypeDirective]
  });
  return generatedTypeMap;
};
/**
 * Given information about a field on a relationship type, builds
 * the AST for associated input value definitions used by input
 * types generated for the Query API
 */


var buildRelationshipSelectionArgumentInputTypes = function buildRelationshipSelectionArgumentInputTypes(_ref8) {
  var fromType = _ref8.fromType,
      toType = _ref8.toType,
      relatedType = _ref8.relatedType,
      relationshipFilterTypeName = _ref8.relationshipFilterTypeName,
      generatedTypeMap = _ref8.generatedTypeMap,
      relationshipInputTypeMap = _ref8.relationshipInputTypeMap,
      typeDefinitionMap = _ref8.typeDefinitionMap;
  var relationshipFilteringFields = relationshipInputTypeMap[_inputValues.FilteringArgument.FILTER].fields;
  var relatedTypeFilterName = relationshipInputTypeMap[_inputValues.FilteringArgument.FILTER].name;

  if (fromType === toType) {
    var reflexiveFilteringTypeName = "".concat(relationshipFilterTypeName, "Filter");
    generatedTypeMap[reflexiveFilteringTypeName] = (0, _ast.buildInputObjectType)({
      name: (0, _ast.buildName)({
        name: reflexiveFilteringTypeName
      }),
      fields: buildNodeInputFields({
        fromType: relatedTypeFilterName,
        toType: relatedTypeFilterName
      })
    });
  }

  var relatedTypeFilteringField = (0, _ast.buildInputValue)({
    name: (0, _ast.buildName)({
      name: relatedType
    }),
    type: (0, _ast.buildNamedType)({
      name: "_".concat(relatedType, "Filter")
    })
  });
  relationshipFilteringFields.push(relatedTypeFilteringField);
  generatedTypeMap = (0, _inputValues.buildQueryFilteringInputType)({
    typeName: relatedTypeFilterName,
    typeDefinitionMap: typeDefinitionMap,
    generatedTypeMap: generatedTypeMap,
    inputTypeMap: relationshipInputTypeMap
  });
  return generatedTypeMap;
};
/**
 * Builds the AST definitions for the input values of the
 * incoming and outgoing nodes, used as relationship mutation
 * field arguments for selecting the related nodes
 */


var buildNodeInputFields = function buildNodeInputFields(_ref9) {
  var fromType = _ref9.fromType,
      toType = _ref9.toType;
  return [(0, _ast.buildInputValue)({
    name: (0, _ast.buildName)({
      name: _relationship.RelationshipDirectionField.FROM
    }),
    type: (0, _ast.buildNamedType)({
      name: fromType
    })
  }), (0, _ast.buildInputValue)({
    name: (0, _ast.buildName)({
      name: _relationship.RelationshipDirectionField.TO
    }),
    type: (0, _ast.buildNamedType)({
      name: toType
    })
  })];
};
/**
 * Given the name of a type, and the names of the node types
 * of a relationship type, decides which type it is related to
 * (possibly itself)
 */


var decideRelatedType = function decideRelatedType(_ref10) {
  var typeName = _ref10.typeName,
      fromType = _ref10.fromType,
      toType = _ref10.toType;
  var relatedType = toType;

  if (fromType !== toType) {
    // Interpret relationship direction
    if (typeName === toType) {
      // Is incoming relationship
      relatedType = fromType;
    }
  }

  return relatedType;
};
/**
 * Validates that a given relationship type field on a node type
 * has that node type as its 'from' or 'to' node type field
 */


var validateRelationTypeDirectedFields = function validateRelationTypeDirectedFields(typeName, fieldName, fromName, toName, outputType) {
  // directive to and from are not the same and neither are equal to this
  if (fromName !== toName && toName !== typeName && fromName !== typeName) {
    throw new Error("The ".concat(fieldName, " field on the ").concat(typeName, " node type uses the ").concat(outputType, " relationship type but ").concat(outputType, " comes from ").concat(fromName, " and goes to ").concat(toName));
  }

  return true;
};