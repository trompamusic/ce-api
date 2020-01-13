"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs2/helpers/interopRequireDefault");

var _Object$defineProperty = require("@babel/runtime-corejs2/core-js/object/define-property");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.augmentRelationshipTypeField = exports.RelationshipDirectionField = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/defineProperty"));

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/slicedToArray"));

var _query = require("./query");

var _mutation = require("./mutation");

var _fields = require("../../fields");

var _inputValues = require("../../input-values");

var _directives = require("../../directives");

var _types = require("../../types/types");

// An enum for the semantics of the directed fields of a relationship type
var RelationshipDirectionField = {
  FROM: 'from',
  TO: 'to'
};
/**
 * The main export for the augmentation process of a GraphQL
 * type definition representing a Neo4j relationship entity
 */

exports.RelationshipDirectionField = RelationshipDirectionField;

var augmentRelationshipTypeField = function augmentRelationshipTypeField(_ref) {
  var typeName = _ref.typeName,
      definition = _ref.definition,
      fieldType = _ref.fieldType,
      fieldArguments = _ref.fieldArguments,
      fieldDirectives = _ref.fieldDirectives,
      fieldName = _ref.fieldName,
      outputDefinition = _ref.outputDefinition,
      nodeInputTypeMap = _ref.nodeInputTypeMap,
      typeDefinitionMap = _ref.typeDefinitionMap,
      generatedTypeMap = _ref.generatedTypeMap,
      operationTypeMap = _ref.operationTypeMap,
      outputType = _ref.outputType,
      config = _ref.config,
      outputTypeWrappers = _ref.outputTypeWrappers;

  if (!(0, _types.isOperationTypeDefinition)({
    definition: definition,
    operationTypeMap: operationTypeMap
  })) {
    if (!(0, _directives.isCypherField)({
      directives: fieldDirectives
    })) {
      var relationshipTypeDirective = (0, _directives.getDirective)({
        directives: outputDefinition.directives,
        name: _directives.DirectiveDefinition.RELATION
      });
      var relationshipName = (0, _directives.getDirectiveArgument)({
        directive: relationshipTypeDirective,
        name: 'name'
      });
      relationshipName = decideDefaultRelationshipName({
        relationshipTypeDirective: relationshipTypeDirective,
        outputType: outputType,
        relationshipName: relationshipName
      });

      var _augmentRelationshipT = augmentRelationshipTypeFields({
        typeName: typeName,
        outputType: outputType,
        outputDefinition: outputDefinition,
        typeDefinitionMap: typeDefinitionMap,
        config: config
      }),
          _augmentRelationshipT2 = (0, _slicedToArray2["default"])(_augmentRelationshipT, 5),
          fromType = _augmentRelationshipT2[0],
          toType = _augmentRelationshipT2[1],
          propertyInputValues = _augmentRelationshipT2[2],
          propertyOutputFields = _augmentRelationshipT2[3],
          relationshipInputTypeMap = _augmentRelationshipT2[4];

      var _augmentRelationshipQ = (0, _query.augmentRelationshipQueryAPI)({
        typeName: typeName,
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
        config: config,
        relationshipName: relationshipName,
        fieldType: fieldType,
        propertyOutputFields: propertyOutputFields
      });

      var _augmentRelationshipQ2 = (0, _slicedToArray2["default"])(_augmentRelationshipQ, 5);

      fieldType = _augmentRelationshipQ2[0];
      fieldArguments = _augmentRelationshipQ2[1];
      typeDefinitionMap = _augmentRelationshipQ2[2];
      generatedTypeMap = _augmentRelationshipQ2[3];
      nodeInputTypeMap = _augmentRelationshipQ2[4];

      var _augmentRelationshipM = (0, _mutation.augmentRelationshipMutationAPI)({
        typeName: typeName,
        fieldName: fieldName,
        outputType: outputType,
        fromType: fromType,
        toType: toType,
        relationshipName: relationshipName,
        propertyInputValues: propertyInputValues,
        propertyOutputFields: propertyOutputFields,
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
  }

  return [fieldType, fieldArguments, nodeInputTypeMap, typeDefinitionMap, generatedTypeMap, operationTypeMap];
};
/**
 * Iterates through all field definitions of a relationship type, deciding whether
 * to generate the corresponding field or input value definitions that compose
 * the output and input types used in the Query and Mutation API
 */


exports.augmentRelationshipTypeField = augmentRelationshipTypeField;

var augmentRelationshipTypeFields = function augmentRelationshipTypeFields(_ref2) {
  var typeName = _ref2.typeName,
      outputType = _ref2.outputType,
      outputDefinition = _ref2.outputDefinition,
      typeDefinitionMap = _ref2.typeDefinitionMap,
      config = _ref2.config;
  var fields = outputDefinition.fields;
  var fromTypeName = (0, _fields.getFieldType)({
    fields: fields,
    name: RelationshipDirectionField.FROM
  });
  var toTypeName = (0, _fields.getFieldType)({
    fields: fields,
    name: RelationshipDirectionField.TO
  });
  var relatedTypeFilterName = "_".concat(typeName).concat(outputType, "Filter");

  if (fromTypeName === toTypeName) {
    relatedTypeFilterName = "_".concat(outputType, "Filter");
  }

  var relationshipInputTypeMap = (0, _defineProperty2["default"])({}, _inputValues.FilteringArgument.FILTER, {
    name: relatedTypeFilterName,
    fields: []
  });
  var propertyInputValues = [];
  var propertyOutputFields = fields.reduce(function (outputFields, field) {
    var fieldName = field.name.value;
    var fieldDirectives = field.directives;

    if (!(0, _directives.isIgnoredField)({
      directives: fieldDirectives
    })) {
      var unwrappedType = (0, _fields.unwrapNamedType)({
        type: field.type
      });
      var _outputType = unwrappedType.name;
      var outputTypeWrappers = unwrappedType.wrappers;
      var fieldDefinition = typeDefinitionMap[_outputType];
      var outputKind = fieldDefinition ? fieldDefinition.kind : '';

      if ((0, _fields.isPropertyTypeField)({
        kind: outputKind,
        type: _outputType
      })) {
        relationshipInputTypeMap = (0, _inputValues.augmentInputTypePropertyFields)({
          inputTypeMap: relationshipInputTypeMap,
          fieldName: fieldName,
          fieldDirectives: fieldDirectives,
          outputType: _outputType,
          outputKind: outputKind,
          outputTypeWrappers: outputTypeWrappers
        });
        propertyInputValues.push({
          name: fieldName,
          type: unwrappedType,
          directives: fieldDirectives
        });
        outputFields.push(field);
      }
    }

    return outputFields;
  }, []);
  return [fromTypeName, toTypeName, propertyInputValues, propertyOutputFields, relationshipInputTypeMap];
};
/**
 * Generates a default value for the name argument
 * of the relation type directive, if none is provided
 */


var decideDefaultRelationshipName = function decideDefaultRelationshipName(_ref3) {
  var relationshipTypeDirective = _ref3.relationshipTypeDirective,
      outputType = _ref3.outputType,
      relationshipName = _ref3.relationshipName;

  if (relationshipTypeDirective && !relationshipName) {
    relationshipName = (0, _fields.toSnakeCase)(outputType);
  }

  return relationshipName;
};