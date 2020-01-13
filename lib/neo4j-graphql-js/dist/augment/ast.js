"use strict";

var _Object$defineProperty = require("@babel/runtime-corejs2/core-js/object/define-property");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.buildDirectiveDefinition = exports.buildInputObjectType = exports.buildEnumValue = exports.buildEnumType = exports.buildInputValue = exports.buildField = exports.buildObjectType = exports.buildOperationType = exports.buildSchemaDefinition = exports.buildNamedType = exports.buildDirective = exports.buildDirectiveArgument = exports.buildDocument = exports.buildName = void 0;

var _graphql = require("graphql");

var _fields = require("./fields");

/**
 * Builds the AST definition for a Name
 */
var buildName = function buildName(_ref) {
  var _ref$name = _ref.name,
      name = _ref$name === void 0 ? '' : _ref$name;
  return {
    kind: _graphql.Kind.NAME,
    value: name
  };
};
/**
 * Builds the AST definition for a Document
 */


exports.buildName = buildName;

var buildDocument = function buildDocument(_ref2) {
  var _ref2$definitions = _ref2.definitions,
      definitions = _ref2$definitions === void 0 ? [] : _ref2$definitions;
  return {
    kind: _graphql.Kind.DOCUMENT,
    definitions: definitions
  };
};
/**
 * Builds the AST definition for a Directive Argument
 */


exports.buildDocument = buildDocument;

var buildDirectiveArgument = function buildDirectiveArgument(_ref3) {
  var _ref3$name = _ref3.name,
      name = _ref3$name === void 0 ? '' : _ref3$name,
      value = _ref3.value;
  return {
    kind: _graphql.Kind.ARGUMENT,
    name: name,
    value: value
  };
};
/**
 * Builds the AST definition for a Directive instance
 */


exports.buildDirectiveArgument = buildDirectiveArgument;

var buildDirective = function buildDirective(_ref4) {
  var _ref4$name = _ref4.name,
      name = _ref4$name === void 0 ? '' : _ref4$name,
      _ref4$args = _ref4.args,
      args = _ref4$args === void 0 ? [] : _ref4$args;
  return {
    kind: _graphql.Kind.DIRECTIVE,
    name: name,
    arguments: args
  };
};
/**
 * Builds the AST definition for a type
 */


exports.buildDirective = buildDirective;

var buildNamedType = function buildNamedType(_ref5) {
  var _ref5$name = _ref5.name,
      name = _ref5$name === void 0 ? '' : _ref5$name,
      _ref5$wrappers = _ref5.wrappers,
      wrappers = _ref5$wrappers === void 0 ? {} : _ref5$wrappers;
  var type = {
    kind: _graphql.Kind.NAMED_TYPE,
    name: buildName({
      name: name
    })
  };

  if (wrappers[_fields.TypeWrappers.NON_NULL_NAMED_TYPE]) {
    type = {
      kind: _graphql.Kind.NON_NULL_TYPE,
      type: type
    };
  }

  if (wrappers[_fields.TypeWrappers.LIST_TYPE]) {
    type = {
      kind: _graphql.Kind.LIST_TYPE,
      type: type
    };
  }

  if (wrappers[_fields.TypeWrappers.NON_NULL_LIST_TYPE]) {
    type = {
      kind: _graphql.Kind.NON_NULL_TYPE,
      type: type
    };
  }

  return type;
};
/**
 * Builds the AST definition for a schema type
 */


exports.buildNamedType = buildNamedType;

var buildSchemaDefinition = function buildSchemaDefinition(_ref6) {
  var _ref6$operationTypes = _ref6.operationTypes,
      operationTypes = _ref6$operationTypes === void 0 ? [] : _ref6$operationTypes;
  return {
    kind: _graphql.Kind.SCHEMA_DEFINITION,
    operationTypes: operationTypes
  };
};
/**
 * Builds the AST definition for an operation type on
 * the schema type
 */


exports.buildSchemaDefinition = buildSchemaDefinition;

var buildOperationType = function buildOperationType(_ref7) {
  var _ref7$operation = _ref7.operation,
      operation = _ref7$operation === void 0 ? '' : _ref7$operation,
      _ref7$type = _ref7.type,
      type = _ref7$type === void 0 ? {} : _ref7$type;
  return {
    kind: _graphql.Kind.OPERATION_TYPE_DEFINITION,
    operation: operation,
    type: type
  };
};
/**
 * Builds the AST definition for an Object type
 */


exports.buildOperationType = buildOperationType;

var buildObjectType = function buildObjectType(_ref8) {
  var _ref8$name = _ref8.name,
      name = _ref8$name === void 0 ? '' : _ref8$name,
      _ref8$fields = _ref8.fields,
      fields = _ref8$fields === void 0 ? [] : _ref8$fields,
      _ref8$directives = _ref8.directives,
      directives = _ref8$directives === void 0 ? [] : _ref8$directives,
      description = _ref8.description;
  return {
    kind: _graphql.Kind.OBJECT_TYPE_DEFINITION,
    name: name,
    fields: fields,
    directives: directives,
    description: description
  };
};
/**
 * Builds the AST definition for a Field
 */


exports.buildObjectType = buildObjectType;

var buildField = function buildField(_ref9) {
  var _ref9$name = _ref9.name,
      name = _ref9$name === void 0 ? '' : _ref9$name,
      _ref9$type = _ref9.type,
      type = _ref9$type === void 0 ? {} : _ref9$type,
      _ref9$args = _ref9.args,
      args = _ref9$args === void 0 ? [] : _ref9$args,
      _ref9$directives = _ref9.directives,
      directives = _ref9$directives === void 0 ? [] : _ref9$directives,
      description = _ref9.description;
  return {
    kind: _graphql.Kind.FIELD_DEFINITION,
    name: name,
    type: type,
    arguments: args,
    directives: directives,
    description: description
  };
};
/**
 * Builds the AST definition for an Input Value,
 * used for both field arguments and input object types
 */


exports.buildField = buildField;

var buildInputValue = function buildInputValue(_ref10) {
  var _ref10$name = _ref10.name,
      name = _ref10$name === void 0 ? '' : _ref10$name,
      _ref10$type = _ref10.type,
      type = _ref10$type === void 0 ? {} : _ref10$type,
      _ref10$directives = _ref10.directives,
      directives = _ref10$directives === void 0 ? [] : _ref10$directives,
      defaultValue = _ref10.defaultValue,
      description = _ref10.description;
  return {
    kind: _graphql.Kind.INPUT_VALUE_DEFINITION,
    name: name,
    type: type,
    directives: directives,
    defaultValue: defaultValue,
    description: description
  };
};
/**
 * Builds the AST definition for an Enum type
 */


exports.buildInputValue = buildInputValue;

var buildEnumType = function buildEnumType(_ref11) {
  var _ref11$name = _ref11.name,
      name = _ref11$name === void 0 ? '' : _ref11$name,
      _ref11$values = _ref11.values,
      values = _ref11$values === void 0 ? [] : _ref11$values,
      description = _ref11.description;
  return {
    kind: _graphql.Kind.ENUM_TYPE_DEFINITION,
    name: name,
    values: values,
    description: description
  };
};
/**
 * Builds the AST definition for an Enum type value
 */


exports.buildEnumType = buildEnumType;

var buildEnumValue = function buildEnumValue(_ref12) {
  var _ref12$name = _ref12.name,
      name = _ref12$name === void 0 ? '' : _ref12$name,
      description = _ref12.description;
  return {
    kind: _graphql.Kind.ENUM_VALUE_DEFINITION,
    name: name,
    description: description
  };
};
/**
 * Builds the AST definition for an Input Object type
 */


exports.buildEnumValue = buildEnumValue;

var buildInputObjectType = function buildInputObjectType(_ref13) {
  var _ref13$name = _ref13.name,
      name = _ref13$name === void 0 ? '' : _ref13$name,
      _ref13$fields = _ref13.fields,
      fields = _ref13$fields === void 0 ? [] : _ref13$fields,
      _ref13$directives = _ref13.directives,
      directives = _ref13$directives === void 0 ? [] : _ref13$directives,
      description = _ref13.description;
  return {
    kind: _graphql.Kind.INPUT_OBJECT_TYPE_DEFINITION,
    name: name,
    fields: fields,
    directives: directives,
    description: description
  };
};
/**
 * Builds the AST definition for a Directive definition
 */


exports.buildInputObjectType = buildInputObjectType;

var buildDirectiveDefinition = function buildDirectiveDefinition(_ref14) {
  var _ref14$name = _ref14.name,
      name = _ref14$name === void 0 ? '' : _ref14$name,
      _ref14$args = _ref14.args,
      args = _ref14$args === void 0 ? [] : _ref14$args,
      _ref14$locations = _ref14.locations,
      locations = _ref14$locations === void 0 ? [] : _ref14$locations,
      description = _ref14.description;
  return {
    kind: _graphql.Kind.DIRECTIVE_DEFINITION,
    name: name,
    arguments: args,
    locations: locations,
    description: description
  };
};

exports.buildDirectiveDefinition = buildDirectiveDefinition;