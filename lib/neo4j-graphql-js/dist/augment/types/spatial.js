"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs2/helpers/interopRequireDefault");

var _Object$defineProperty = require("@babel/runtime-corejs2/core-js/object/define-property");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.augmentSpatialTypes = exports.Neo4jPointDistanceArgument = exports.Neo4jPointDistanceFilter = exports.Neo4jPoint = exports.SpatialType = void 0;

var _typeof2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/typeof"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/defineProperty"));

var _graphql = require("graphql");

var _types = require("../types/types");

var _ast = require("../ast");

var _fields = require("../fields");

var _Neo4jPoint;

/**
 * An enum describing the name of the Neo4j Point type
 */
var SpatialType = {
  POINT: 'Point'
};
/**
 * An enum describing the property names of the Neo4j Point type
 * See: https://neo4j.com/docs/cypher-manual/current/syntax/spatial/#cypher-spatial-instants
 */

exports.SpatialType = SpatialType;
var Neo4jPointField = {
  X: 'x',
  Y: 'y',
  Z: 'z',
  LONGITUDE: 'longitude',
  LATITUDE: 'latitude',
  HEIGHT: 'height',
  CRS: 'crs',
  SRID: 'srid'
};
/**
 * A map of the Neo4j Temporal Time type fields to their respective
 * GraphQL types
 */

var Neo4jPoint = (_Neo4jPoint = {}, (0, _defineProperty2["default"])(_Neo4jPoint, Neo4jPointField.X, _graphql.GraphQLFloat.name), (0, _defineProperty2["default"])(_Neo4jPoint, Neo4jPointField.Y, _graphql.GraphQLFloat.name), (0, _defineProperty2["default"])(_Neo4jPoint, Neo4jPointField.Z, _graphql.GraphQLFloat.name), (0, _defineProperty2["default"])(_Neo4jPoint, Neo4jPointField.LONGITUDE, _graphql.GraphQLFloat.name), (0, _defineProperty2["default"])(_Neo4jPoint, Neo4jPointField.LATITUDE, _graphql.GraphQLFloat.name), (0, _defineProperty2["default"])(_Neo4jPoint, Neo4jPointField.HEIGHT, _graphql.GraphQLFloat.name), (0, _defineProperty2["default"])(_Neo4jPoint, Neo4jPointField.CRS, _graphql.GraphQLString.name), (0, _defineProperty2["default"])(_Neo4jPoint, Neo4jPointField.SRID, _graphql.GraphQLInt.name), _Neo4jPoint);
exports.Neo4jPoint = Neo4jPoint;
var Neo4jPointDistanceFilter = {
  DISTANCE: 'distance',
  DISTANCE_LESS_THAN: 'distance_lt',
  DISTANCE_LESS_THAN_OR_EQUAL: 'distance_lte',
  DISTANCE_GREATER_THAN: 'distance_gt',
  DISTANCE_GREATER_THAN_OR_EQUAL: 'distance_gte'
};
exports.Neo4jPointDistanceFilter = Neo4jPointDistanceFilter;
var Neo4jPointDistanceArgument = {
  POINT: 'point',
  DISTANCE: 'distance'
};
/**
 * The main export for building the GraphQL input and output type definitions
 * for Neo4j Temporal property types
 */

exports.Neo4jPointDistanceArgument = Neo4jPointDistanceArgument;

var augmentSpatialTypes = function augmentSpatialTypes(_ref) {
  var typeMap = _ref.typeMap,
      _ref$config = _ref.config,
      config = _ref$config === void 0 ? {} : _ref$config;
  config.spatial = decideSpatialConfig({
    config: config
  });
  typeMap = buildSpatialDistanceFilterInputType({
    typeMap: typeMap,
    config: config
  });
  return (0, _types.buildNeo4jTypes)({
    typeMap: typeMap,
    neo4jTypes: SpatialType,
    config: config.spatial
  });
};
/**
 * A helper function for ensuring a fine-grained spatial
 * configmration
 */


exports.augmentSpatialTypes = augmentSpatialTypes;

var decideSpatialConfig = function decideSpatialConfig(_ref2) {
  var config = _ref2.config;
  var defaultConfig = {
    point: true
  };
  var providedConfig = config ? config.spatial : defaultConfig;

  if (typeof providedConfig === 'boolean') {
    if (providedConfig === false) {
      defaultConfig.point = false;
    }
  } else if ((0, _typeof2["default"])(providedConfig) === 'object') {
    defaultConfig = providedConfig;
  }

  return defaultConfig;
};
/**
 * Builds the AST for the input object definition used for
 * providing arguments to the spatial filters that use the
 * distance Cypher function
 */


var buildSpatialDistanceFilterInputType = function buildSpatialDistanceFilterInputType(_ref3) {
  var _ref3$typeMap = _ref3.typeMap,
      typeMap = _ref3$typeMap === void 0 ? {} : _ref3$typeMap,
      config = _ref3.config;

  if (config.spatial.point) {
    var typeName = "".concat(_types.Neo4jTypeName).concat(SpatialType.POINT, "DistanceFilter"); // Overwrite

    typeMap[typeName] = (0, _ast.buildInputObjectType)({
      name: (0, _ast.buildName)({
        name: typeName
      }),
      fields: [(0, _ast.buildInputValue)({
        name: (0, _ast.buildName)({
          name: Neo4jPointDistanceArgument.POINT
        }),
        type: (0, _ast.buildNamedType)({
          name: "".concat(_types.Neo4jTypeName).concat(SpatialType.POINT, "Input"),
          wrappers: (0, _defineProperty2["default"])({}, _fields.TypeWrappers.NON_NULL_NAMED_TYPE, true)
        })
      }), (0, _ast.buildInputValue)({
        name: (0, _ast.buildName)({
          name: Neo4jPointDistanceArgument.DISTANCE
        }),
        type: (0, _ast.buildNamedType)({
          name: _graphql.GraphQLFloat.name,
          wrappers: (0, _defineProperty2["default"])({}, _fields.TypeWrappers.NON_NULL_NAMED_TYPE, true)
        })
      })]
    });
  }

  return typeMap;
};