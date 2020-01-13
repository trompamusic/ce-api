"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs2/helpers/interopRequireDefault");

var _Object$defineProperty2 = require("@babel/runtime-corejs2/core-js/object/define-property");

_Object$defineProperty2(exports, "__esModule", {
  value: true
});

exports.printSchemaDocument = exports.shouldAugmentRelationshipField = exports.shouldAugmentType = exports.mergeDefinitionMaps = exports.mapDefinitions = exports.augmentedSchema = exports.makeAugmentedExecutableSchema = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/define-property"));

var _defineProperties = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/define-properties"));

var _getOwnPropertyDescriptors = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/get-own-property-descriptors"));

var _getOwnPropertyDescriptor = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/get-own-property-descriptor"));

var _getOwnPropertySymbols = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/get-own-property-symbols"));

var _typeof2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/typeof"));

var _keys = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/keys"));

var _defineProperty3 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/defineProperty"));

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/toConsumableArray"));

var _values = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/values"));

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/slicedToArray"));

var _graphql = require("graphql");

var _graphqlTools = require("graphql-tools");

var _ast = require("./ast");

var _types = require("./types/types");

var _directives = require("./directives");

var _resolvers = require("./resolvers");

var _auth = require("../auth");

function ownKeys(object, enumerableOnly) { var keys = (0, _keys["default"])(object); if (_getOwnPropertySymbols["default"]) { var symbols = (0, _getOwnPropertySymbols["default"])(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return (0, _getOwnPropertyDescriptor["default"])(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty3["default"])(target, key, source[key]); }); } else if (_getOwnPropertyDescriptors["default"]) { (0, _defineProperties["default"])(target, (0, _getOwnPropertyDescriptors["default"])(source)); } else { ownKeys(Object(source)).forEach(function (key) { (0, _defineProperty2["default"])(target, key, (0, _getOwnPropertyDescriptor["default"])(source, key)); }); } } return target; }

/**
 * The main export for augmenting an SDL document
 */
var makeAugmentedExecutableSchema = function makeAugmentedExecutableSchema(_ref) {
  var typeDefs = _ref.typeDefs,
      resolvers = _ref.resolvers,
      logger = _ref.logger,
      allowUndefinedInResolve = _ref.allowUndefinedInResolve,
      resolverValidationOptions = _ref.resolverValidationOptions,
      directiveResolvers = _ref.directiveResolvers,
      _ref$schemaDirectives = _ref.schemaDirectives,
      schemaDirectives = _ref$schemaDirectives === void 0 ? {} : _ref$schemaDirectives,
      parseOptions = _ref.parseOptions,
      inheritResolversFromInterfaces = _ref.inheritResolversFromInterfaces,
      config = _ref.config;
  config = setDefaultConfig({
    config: config
  });
  var definitions = (0, _graphql.parse)(typeDefs).definitions;
  var generatedTypeMap = {};

  var _mapDefinitions = mapDefinitions({
    definitions: definitions,
    config: config
  }),
      _mapDefinitions2 = (0, _slicedToArray2["default"])(_mapDefinitions, 5),
      typeDefinitionMap = _mapDefinitions2[0],
      typeExtensionDefinitionMap = _mapDefinitions2[1],
      directiveDefinitionMap = _mapDefinitions2[2],
      operationTypeMap = _mapDefinitions2[3],
      schemaTypeDefinition = _mapDefinitions2[4];

  var _augmentTypes = (0, _types.augmentTypes)({
    typeDefinitionMap: typeDefinitionMap,
    typeExtensionDefinitionMap: typeExtensionDefinitionMap,
    generatedTypeMap: generatedTypeMap,
    operationTypeMap: operationTypeMap,
    config: config
  });

  var _augmentTypes2 = (0, _slicedToArray2["default"])(_augmentTypes, 3);

  typeExtensionDefinitionMap = _augmentTypes2[0];
  generatedTypeMap = _augmentTypes2[1];
  operationTypeMap = _augmentTypes2[2];

  var _augmentDirectiveDefi = (0, _directives.augmentDirectiveDefinitions)({
    typeDefinitionMap: generatedTypeMap,
    directiveDefinitionMap: directiveDefinitionMap,
    config: config
  });

  var _augmentDirectiveDefi2 = (0, _slicedToArray2["default"])(_augmentDirectiveDefi, 2);

  generatedTypeMap = _augmentDirectiveDefi2[0];
  directiveDefinitionMap = _augmentDirectiveDefi2[1];
  schemaDirectives = (0, _auth.addAuthDirectiveImplementations)(schemaDirectives, generatedTypeMap, config);
  var mergedDefinitions = mergeDefinitionMaps({
    generatedTypeMap: generatedTypeMap,
    typeExtensionDefinitionMap: typeExtensionDefinitionMap,
    operationTypeMap: operationTypeMap,
    directiveDefinitionMap: directiveDefinitionMap,
    schemaTypeDefinition: schemaTypeDefinition
  });
  var transformedDefinitions = (0, _types.transformNeo4jTypes)({
    definitions: mergedDefinitions,
    config: config
  });
  var documentAST = (0, _ast.buildDocument)({
    definitions: transformedDefinitions
  });
  var augmentedResolvers = (0, _resolvers.augmentResolvers)(generatedTypeMap, operationTypeMap, resolvers, config);
  resolverValidationOptions.requireResolversForResolveType = false;
  return (0, _graphqlTools.makeExecutableSchema)({
    typeDefs: (0, _graphql.print)(documentAST),
    resolvers: augmentedResolvers,
    logger: logger,
    allowUndefinedInResolve: allowUndefinedInResolve,
    resolverValidationOptions: resolverValidationOptions,
    directiveResolvers: directiveResolvers,
    schemaDirectives: schemaDirectives,
    parseOptions: parseOptions,
    inheritResolversFromInterfaces: inheritResolversFromInterfaces
  });
};
/**
 * The main export for augmnetation a schema
 */


exports.makeAugmentedExecutableSchema = makeAugmentedExecutableSchema;

var augmentedSchema = function augmentedSchema(schema, config) {
  config = setDefaultConfig({
    config: config
  });
  var definitions = extractSchemaDefinitions({
    schema: schema
  });

  var _mapDefinitions3 = mapDefinitions({
    definitions: definitions,
    config: config
  }),
      _mapDefinitions4 = (0, _slicedToArray2["default"])(_mapDefinitions3, 5),
      typeDefinitionMap = _mapDefinitions4[0],
      typeExtensionDefinitionMap = _mapDefinitions4[1],
      directiveDefinitionMap = _mapDefinitions4[2],
      operationTypeMap = _mapDefinitions4[3],
      schemaTypeDefinition = _mapDefinitions4[4];

  var generatedTypeMap = {};

  var _augmentTypes3 = (0, _types.augmentTypes)({
    typeDefinitionMap: typeDefinitionMap,
    typeExtensionDefinitionMap: typeExtensionDefinitionMap,
    generatedTypeMap: generatedTypeMap,
    operationTypeMap: operationTypeMap,
    config: config
  });

  var _augmentTypes4 = (0, _slicedToArray2["default"])(_augmentTypes3, 3);

  typeExtensionDefinitionMap = _augmentTypes4[0];
  generatedTypeMap = _augmentTypes4[1];
  operationTypeMap = _augmentTypes4[2];

  var _augmentDirectiveDefi3 = (0, _directives.augmentDirectiveDefinitions)({
    typeDefinitionMap: generatedTypeMap,
    directiveDefinitionMap: directiveDefinitionMap,
    config: config
  });

  var _augmentDirectiveDefi4 = (0, _slicedToArray2["default"])(_augmentDirectiveDefi3, 2);

  generatedTypeMap = _augmentDirectiveDefi4[0];
  directiveDefinitionMap = _augmentDirectiveDefi4[1];
  var schemaDirectives = {};
  schemaDirectives = (0, _auth.addAuthDirectiveImplementations)(schemaDirectives, generatedTypeMap, config);
  var mergedDefinitions = mergeDefinitionMaps({
    generatedTypeMap: generatedTypeMap,
    typeExtensionDefinitionMap: typeExtensionDefinitionMap,
    operationTypeMap: operationTypeMap,
    directiveDefinitionMap: directiveDefinitionMap,
    schemaTypeDefinition: schemaTypeDefinition
  });
  var transformedDefinitions = (0, _types.transformNeo4jTypes)({
    definitions: mergedDefinitions,
    config: config
  });
  var documentAST = (0, _ast.buildDocument)({
    definitions: transformedDefinitions
  });
  var resolvers = (0, _resolvers.extractResolversFromSchema)(schema);
  var augmentedResolvers = (0, _resolvers.augmentResolvers)(generatedTypeMap, operationTypeMap, resolvers, config);
  return (0, _graphqlTools.makeExecutableSchema)({
    typeDefs: (0, _graphql.print)(documentAST),
    resolvers: augmentedResolvers,
    resolverValidationOptions: {
      requireResolversForResolveType: false
    },
    schemaDirectives: schemaDirectives
  });
};
/**
 * Builds separate type definition maps for use in augmentation
 */


exports.augmentedSchema = augmentedSchema;

var mapDefinitions = function mapDefinitions(_ref2) {
  var _ref2$definitions = _ref2.definitions,
      definitions = _ref2$definitions === void 0 ? [] : _ref2$definitions,
      _ref2$config = _ref2.config,
      config = _ref2$config === void 0 ? {} : _ref2$config;
  var typeExtensionDefinitionMap = {};
  var directiveDefinitionMap = {};
  var typeDefinitionMap = {};
  var schemaTypeDefinition = undefined;
  definitions.forEach(function (def) {
    if (def.kind === _graphql.Kind.SCHEMA_DEFINITION) {
      schemaTypeDefinition = def;
    } else if ((0, _graphql.isTypeDefinitionNode)(def)) {
      var name = def.name.value;
      typeDefinitionMap[name] = def;
    } else if ((0, _graphql.isTypeExtensionNode)(def)) {
      var _name = def.name.value;

      if (!typeExtensionDefinitionMap[_name]) {
        typeExtensionDefinitionMap[_name] = [];
      }

      typeExtensionDefinitionMap[_name].push(def);
    } else if (def.kind === _graphql.Kind.DIRECTIVE_DEFINITION) {
      var _name2 = def.name.value;
      directiveDefinitionMap[_name2] = def;
    }
  });

  var _initializeOperationT = (0, _types.initializeOperationTypes)({
    typeDefinitionMap: typeDefinitionMap,
    schemaTypeDefinition: schemaTypeDefinition,
    config: config
  }),
      _initializeOperationT2 = (0, _slicedToArray2["default"])(_initializeOperationT, 2),
      typeMap = _initializeOperationT2[0],
      operationTypeMap = _initializeOperationT2[1];

  return [typeMap, typeExtensionDefinitionMap, directiveDefinitionMap, operationTypeMap, schemaTypeDefinition];
};
/**
 * Merges back together all type definition maps used in augmentation
 */


exports.mapDefinitions = mapDefinitions;

var mergeDefinitionMaps = function mergeDefinitionMaps(_ref3) {
  var _ref3$generatedTypeMa = _ref3.generatedTypeMap,
      generatedTypeMap = _ref3$generatedTypeMa === void 0 ? {} : _ref3$generatedTypeMa,
      _ref3$typeExtensionDe = _ref3.typeExtensionDefinitionMap,
      typeExtensionDefinitionMap = _ref3$typeExtensionDe === void 0 ? {} : _ref3$typeExtensionDe,
      _ref3$operationTypeMa = _ref3.operationTypeMap,
      operationTypeMap = _ref3$operationTypeMa === void 0 ? {} : _ref3$operationTypeMa,
      _ref3$directiveDefini = _ref3.directiveDefinitionMap,
      directiveDefinitionMap = _ref3$directiveDefini === void 0 ? {} : _ref3$directiveDefini,
      schemaTypeDefinition = _ref3.schemaTypeDefinition;
  var typeExtensions = (0, _values["default"])(typeExtensionDefinitionMap);

  if (typeExtensions) {
    typeExtensionDefinitionMap = typeExtensions.reduce(function (typeExtensions, extensions) {
      typeExtensions.push.apply(typeExtensions, (0, _toConsumableArray2["default"])(extensions));
      return typeExtensions;
    }, []);
  }

  var definitions = (0, _values["default"])(_objectSpread({}, generatedTypeMap, {}, typeExtensionDefinitionMap, {}, directiveDefinitionMap));
  definitions = (0, _types.augmentSchemaType)({
    definitions: definitions,
    schemaTypeDefinition: schemaTypeDefinition,
    operationTypeMap: operationTypeMap
  });
  return definitions;
};
/**
 * Given a type name, checks whether it is excluded from
 * the Query or Mutation API
 */


exports.mergeDefinitionMaps = mergeDefinitionMaps;

var shouldAugmentType = function shouldAugmentType(config, operationTypeName, typeName) {
  return typeof config[operationTypeName] === 'boolean' ? config[operationTypeName] : // here .exclude should be an object,
  // set at the end of excludeIgnoredTypes
  typeName ? !getExcludedTypes(config, operationTypeName).some(function (excludedType) {
    return excludedType === typeName;
  }) : false;
};
/**
 * Given the type names of the nodes of a relationship, checks
 * whether the relationship is excluded from the API by way of
 * both related nodes being excluded
 */


exports.shouldAugmentType = shouldAugmentType;

var shouldAugmentRelationshipField = function shouldAugmentRelationshipField(config, operationTypeName, fromName, toName) {
  return shouldAugmentType(config, operationTypeName, fromName) && shouldAugmentType(config, operationTypeName, toName);
}; // An enum containing the names of the augmentation config keys


exports.shouldAugmentRelationshipField = shouldAugmentRelationshipField;
var APIConfiguration = {
  QUERY: 'query',
  MUTATION: 'mutation',
  TEMPORAL: 'temporal',
  SPATIAL: 'spatial'
};
/**
 * Builds the default values in a given configuration object
 */

var setDefaultConfig = function setDefaultConfig(_ref4) {
  var _ref4$config = _ref4.config,
      config = _ref4$config === void 0 ? {} : _ref4$config;
  var configKeys = (0, _keys["default"])(config);
  (0, _values["default"])(APIConfiguration).forEach(function (configKey) {
    if (!configKeys.find(function (providedKey) {
      return providedKey === configKey;
    })) {
      config[configKey] = true;
    }
  });
  return config;
};
/**
 * Prints the AST of a GraphQL SDL Document containing definitions
 * extracted from a given schema, along with no loss of directives and a
 * regenerated schema type
 */


var printSchemaDocument = function printSchemaDocument(_ref5) {
  var schema = _ref5.schema;
  return (0, _graphql.print)((0, _ast.buildDocument)({
    definitions: extractSchemaDefinitions({
      schema: schema
    })
  }));
};
/**
 * Extracts type definitions from a schema and regenerates the schema type
 */


exports.printSchemaDocument = printSchemaDocument;

var extractSchemaDefinitions = function extractSchemaDefinitions(_ref6) {
  var _ref6$schema = _ref6.schema,
      schema = _ref6$schema === void 0 ? {} : _ref6$schema;
  var definitions = (0, _values["default"])(_objectSpread({}, schema.getDirectives(), {}, schema.getTypeMap())).reduce(function (astNodes, definition) {
    var astNode = definition.astNode;

    if (astNode) {
      astNodes.push(astNode); // Extract embedded type extensions

      var extensionASTNodes = definition.extensionASTNodes;

      if (extensionASTNodes) {
        astNodes.push.apply(astNodes, (0, _toConsumableArray2["default"])(extensionASTNodes));
      }
    }

    return astNodes;
  }, []);
  definitions = (0, _types.regenerateSchemaType)({
    schema: schema,
    definitions: definitions
  });
  return definitions;
};
/**
 * Getter for an array of type names excludes from an operation type
 */


var getExcludedTypes = function getExcludedTypes(config, operationTypeName) {
  return config && operationTypeName && config[operationTypeName] && (0, _typeof2["default"])(config[operationTypeName]) === 'object' && config[operationTypeName].exclude ? config[operationTypeName].exclude : [];
};