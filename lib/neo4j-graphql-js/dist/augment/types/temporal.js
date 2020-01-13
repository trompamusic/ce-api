"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs2/helpers/interopRequireDefault");

var _Object$defineProperty = require("@babel/runtime-corejs2/core-js/object/define-property");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.augmentTemporalTypes = exports.Neo4jDate = exports.Neo4jTime = exports.Neo4jDateField = exports.Neo4jTimeField = exports.TemporalType = void 0;

var _keys = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/keys"));

var _typeof2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/typeof"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/defineProperty"));

var _graphql = require("graphql");

var _types = require("../types/types");

var _Neo4jTime, _Neo4jDate;

/**
 * An enum describing the names of Neo4j Temporal types
 * See: https://neo4j.com/docs/cypher-manual/current/syntax/temporal/#cypher-temporal-instants
 */
var TemporalType = {
  TIME: 'Time',
  DATE: 'Date',
  DATETIME: 'DateTime',
  LOCALTIME: 'LocalTime',
  LOCALDATETIME: 'LocalDateTime'
};
/**
 * An enum describing the property names of the Neo4j Time type
 */

exports.TemporalType = TemporalType;
var Neo4jTimeField = {
  HOUR: 'hour',
  MINUTE: 'minute',
  SECOND: 'second',
  MILLISECOND: 'millisecond',
  MICROSECOND: 'microsecond',
  NANOSECOND: 'nanosecond',
  TIMEZONE: 'timezone'
};
/**
 * An enum describing the property names of the Neo4j Date type
 */

exports.Neo4jTimeField = Neo4jTimeField;
var Neo4jDateField = {
  YEAR: 'year',
  MONTH: 'month',
  DAY: 'day'
};
/**
 * A map of the Neo4j Temporal Time type fields to their respective
 * GraphQL types
 */

exports.Neo4jDateField = Neo4jDateField;
var Neo4jTime = (_Neo4jTime = {}, (0, _defineProperty2["default"])(_Neo4jTime, Neo4jTimeField.HOUR, _graphql.GraphQLInt.name), (0, _defineProperty2["default"])(_Neo4jTime, Neo4jTimeField.MINUTE, _graphql.GraphQLInt.name), (0, _defineProperty2["default"])(_Neo4jTime, Neo4jTimeField.SECOND, _graphql.GraphQLInt.name), (0, _defineProperty2["default"])(_Neo4jTime, Neo4jTimeField.MILLISECOND, _graphql.GraphQLInt.name), (0, _defineProperty2["default"])(_Neo4jTime, Neo4jTimeField.MICROSECOND, _graphql.GraphQLInt.name), (0, _defineProperty2["default"])(_Neo4jTime, Neo4jTimeField.NANOSECOND, _graphql.GraphQLInt.name), (0, _defineProperty2["default"])(_Neo4jTime, Neo4jTimeField.TIMEZONE, _graphql.GraphQLString.name), _Neo4jTime);
/**
 * A map of the Neo4j Temporal Date type fields to their respective
 * GraphQL types
 */

exports.Neo4jTime = Neo4jTime;
var Neo4jDate = (_Neo4jDate = {}, (0, _defineProperty2["default"])(_Neo4jDate, Neo4jDateField.YEAR, _graphql.GraphQLInt.name), (0, _defineProperty2["default"])(_Neo4jDate, Neo4jDateField.MONTH, _graphql.GraphQLInt.name), (0, _defineProperty2["default"])(_Neo4jDate, Neo4jDateField.DAY, _graphql.GraphQLInt.name), _Neo4jDate);
/**
 * The main export for building the GraphQL input and output type definitions
 * for Neo4j Temporal property types. Each TemporalType can be constructed
 * using either or both of the Time and Date type fields
 */

exports.Neo4jDate = Neo4jDate;

var augmentTemporalTypes = function augmentTemporalTypes(_ref) {
  var typeMap = _ref.typeMap,
      _ref$config = _ref.config,
      config = _ref$config === void 0 ? {} : _ref$config;
  config.temporal = decideTemporalConfig({
    config: config
  });
  return (0, _types.buildNeo4jTypes)({
    typeMap: typeMap,
    neo4jTypes: TemporalType,
    config: config.temporal
  });
};
/**
 * A helper function for ensuring a fine-grained temporal
 * configmration, used to simplify checking it
 * throughout the augmnetation process
 */


exports.augmentTemporalTypes = augmentTemporalTypes;

var decideTemporalConfig = function decideTemporalConfig(_ref2) {
  var config = _ref2.config;
  var defaultConfig = {
    time: true,
    date: true,
    datetime: true,
    localtime: true,
    localdatetime: true
  };
  var providedConfig = config ? config.temporal : defaultConfig;

  if (typeof providedConfig === 'boolean') {
    if (providedConfig === false) {
      defaultConfig.time = false;
      defaultConfig.date = false;
      defaultConfig.datetime = false;
      defaultConfig.localtime = false;
      defaultConfig.localdatetime = false;
    }
  } else if ((0, _typeof2["default"])(providedConfig) === 'object') {
    (0, _keys["default"])(defaultConfig).forEach(function (e) {
      if (providedConfig[e] === undefined) {
        providedConfig[e] = defaultConfig[e];
      }
    });
    defaultConfig = providedConfig;
  }

  return defaultConfig;
};