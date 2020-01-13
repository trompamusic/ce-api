"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs2/helpers/interopRequireDefault");

var _Object$defineProperty = require("@babel/runtime-corejs2/core-js/object/define-property");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.neo4jgraphql = neo4jgraphql;
exports.cypherQuery = cypherQuery;
exports.cypherMutation = cypherMutation;
exports.inferSchema = exports.makeAugmentedSchema = exports.augmentSchema = exports.augmentTypeDefs = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime-corejs2/regenerator"));

var _stringify = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/json/stringify"));

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/slicedToArray"));

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/objectWithoutProperties"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/asyncToGenerator"));

var _graphql = require("graphql");

var _Neo4jSchemaTree = _interopRequireDefault(require("./neo4j-schema/Neo4jSchemaTree"));

var _graphQLMapper = _interopRequireDefault(require("./neo4j-schema/graphQLMapper"));

var _auth = require("./auth");

var _translate = require("./translate");

var _debug = _interopRequireDefault(require("debug"));

var _utils = require("./utils");

var _augment = require("./augment/augment");

var _types = require("./augment/types/types");

var _ast = require("./augment/ast");

var _directives = require("./augment/directives");

var neo4jGraphQLVersion = require('../package.json').version;

var debug = (0, _debug["default"])('neo4j-graphql-js');

function neo4jgraphql(_x, _x2, _x3, _x4, _x5) {
  return _neo4jgraphql.apply(this, arguments);
}

function _neo4jgraphql() {
  _neo4jgraphql = (0, _asyncToGenerator2["default"])(
  /*#__PURE__*/
  _regenerator["default"].mark(function _callee(object, params, context, resolveInfo, debugFlag) {
    var query, cypherParams, cypherFunction, _cypherFunction, _cypherFunction2, session, result;

    return _regenerator["default"].wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            if (!(0, _auth.checkRequestError)(context)) {
              _context.next = 2;
              break;
            }

            throw new Error((0, _auth.checkRequestError)(context));

          case 2:
            if (context.driver) {
              _context.next = 4;
              break;
            }

            throw new Error("No Neo4j JavaScript driver instance provided. Please ensure a Neo4j JavaScript driver instance is injected into the context object at the key 'driver'.");

          case 4:
            cypherFunction = (0, _utils.isMutation)(resolveInfo) ? cypherMutation : cypherQuery;
            _cypherFunction = cypherFunction(params, context, resolveInfo, debugFlag);
            _cypherFunction2 = (0, _slicedToArray2["default"])(_cypherFunction, 2);
            query = _cypherFunction2[0];
            cypherParams = _cypherFunction2[1];

            if (debugFlag) {
              console.log("\nDeprecation Warning: Remove `debug` parameter and use an environment variable\ninstead: `DEBUG=neo4j-graphql-js`.\n    ");
              console.log(query);
              console.log((0, _stringify["default"])(cypherParams, null, 2));
            }

            debug('%s', query);
            debug('%s', (0, _stringify["default"])(cypherParams, null, 2));
            context.driver._userAgent = "neo4j-graphql-js/".concat(neo4jGraphQLVersion); // TODO: Is this a 4.0 driver instance? Check bolt path for default database name and use that when creating the session

            session = context.driver.session();
            _context.prev = 14;

            if (!(0, _utils.isMutation)(resolveInfo)) {
              _context.next = 21;
              break;
            }

            _context.next = 18;
            return session.writeTransaction(function (tx) {
              return tx.run(query, cypherParams);
            });

          case 18:
            result = _context.sent;
            _context.next = 24;
            break;

          case 21:
            _context.next = 23;
            return session.readTransaction(function (tx) {
              return tx.run(query, cypherParams);
            });

          case 23:
            result = _context.sent;

          case 24:
            _context.prev = 24;
            session.close();
            return _context.finish(24);

          case 27:
            return _context.abrupt("return", (0, _utils.extractQueryResult)(result, resolveInfo.returnType));

          case 28:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, null, [[14,, 24, 27]]);
  }));
  return _neo4jgraphql.apply(this, arguments);
}

function cypherQuery(_ref, context, resolveInfo) {
  var _ref$first = _ref.first,
      first = _ref$first === void 0 ? -1 : _ref$first,
      _ref$offset = _ref.offset,
      offset = _ref$offset === void 0 ? 0 : _ref$offset,
      _id = _ref._id,
      orderBy = _ref.orderBy,
      otherParams = (0, _objectWithoutProperties2["default"])(_ref, ["first", "offset", "_id", "orderBy"]);

  var _typeIdentifiers = (0, _utils.typeIdentifiers)(resolveInfo.returnType),
      typeName = _typeIdentifiers.typeName,
      variableName = _typeIdentifiers.variableName;

  var schemaType = resolveInfo.schema.getType(typeName);
  var selections = (0, _utils.getPayloadSelections)(resolveInfo);
  return (0, _translate.translateQuery)({
    resolveInfo: resolveInfo,
    context: context,
    schemaType: schemaType,
    selections: selections,
    variableName: variableName,
    typeName: typeName,
    first: first,
    offset: offset,
    _id: _id,
    orderBy: orderBy,
    otherParams: otherParams
  });
}

function cypherMutation(_ref2, context, resolveInfo) {
  var _ref2$first = _ref2.first,
      first = _ref2$first === void 0 ? -1 : _ref2$first,
      _ref2$offset = _ref2.offset,
      offset = _ref2$offset === void 0 ? 0 : _ref2$offset,
      _id = _ref2._id,
      orderBy = _ref2.orderBy,
      otherParams = (0, _objectWithoutProperties2["default"])(_ref2, ["first", "offset", "_id", "orderBy"]);

  var _typeIdentifiers2 = (0, _utils.typeIdentifiers)(resolveInfo.returnType),
      typeName = _typeIdentifiers2.typeName,
      variableName = _typeIdentifiers2.variableName;

  var schemaType = resolveInfo.schema.getType(typeName);
  var selections = (0, _utils.getPayloadSelections)(resolveInfo);
  return (0, _translate.translateMutation)({
    resolveInfo: resolveInfo,
    context: context,
    schemaType: schemaType,
    selections: selections,
    variableName: variableName,
    typeName: typeName,
    first: first,
    offset: offset,
    otherParams: otherParams
  });
}

var augmentTypeDefs = function augmentTypeDefs(typeDefs) {
  var config = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  config.query = false;
  config.mutation = false;
  var definitions = (0, _graphql.parse)(typeDefs).definitions;
  var generatedTypeMap = {};

  var _mapDefinitions = (0, _augment.mapDefinitions)({
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

  typeDefinitionMap = _augmentDirectiveDefi2[0];
  directiveDefinitionMap = _augmentDirectiveDefi2[1];
  var mergedDefinitions = (0, _augment.mergeDefinitionMaps)({
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
  typeDefs = (0, _graphql.print)(documentAST);
  return typeDefs;
};

exports.augmentTypeDefs = augmentTypeDefs;

var augmentSchema = function augmentSchema(schema, config) {
  return (0, _augment.augmentedSchema)(schema, config);
};

exports.augmentSchema = augmentSchema;

var makeAugmentedSchema = function makeAugmentedSchema(_ref3) {
  var schema = _ref3.schema,
      typeDefs = _ref3.typeDefs,
      _ref3$resolvers = _ref3.resolvers,
      resolvers = _ref3$resolvers === void 0 ? {} : _ref3$resolvers,
      logger = _ref3.logger,
      _ref3$allowUndefinedI = _ref3.allowUndefinedInResolve,
      allowUndefinedInResolve = _ref3$allowUndefinedI === void 0 ? false : _ref3$allowUndefinedI,
      _ref3$resolverValidat = _ref3.resolverValidationOptions,
      resolverValidationOptions = _ref3$resolverValidat === void 0 ? {} : _ref3$resolverValidat,
      _ref3$directiveResolv = _ref3.directiveResolvers,
      directiveResolvers = _ref3$directiveResolv === void 0 ? null : _ref3$directiveResolv,
      _ref3$schemaDirective = _ref3.schemaDirectives,
      schemaDirectives = _ref3$schemaDirective === void 0 ? {} : _ref3$schemaDirective,
      _ref3$parseOptions = _ref3.parseOptions,
      parseOptions = _ref3$parseOptions === void 0 ? {} : _ref3$parseOptions,
      _ref3$inheritResolver = _ref3.inheritResolversFromInterfaces,
      inheritResolversFromInterfaces = _ref3$inheritResolver === void 0 ? false : _ref3$inheritResolver,
      config = _ref3.config;

  if (schema) {
    return (0, _augment.augmentedSchema)(schema, config);
  }

  if (!typeDefs) throw new Error('Must provide typeDefs');
  return (0, _augment.makeAugmentedExecutableSchema)({
    typeDefs: typeDefs,
    resolvers: resolvers,
    logger: logger,
    allowUndefinedInResolve: allowUndefinedInResolve,
    resolverValidationOptions: resolverValidationOptions,
    directiveResolvers: directiveResolvers,
    schemaDirectives: schemaDirectives,
    parseOptions: parseOptions,
    inheritResolversFromInterfaces: inheritResolversFromInterfaces,
    config: config
  });
};
/**
 * Infer a GraphQL schema by inspecting the contents of a Neo4j instance.
 * @param {} driver
 * @returns a GraphQL schema.
 */


exports.makeAugmentedSchema = makeAugmentedSchema;

var inferSchema = function inferSchema(driver) {
  var config = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var tree = new _Neo4jSchemaTree["default"](driver, config);
  return tree.initialize().then(_graphQLMapper["default"]);
};

exports.inferSchema = inferSchema;