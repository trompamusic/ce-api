"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs2/helpers/interopRequireDefault");

var _Object$defineProperty = require("@babel/runtime-corejs2/core-js/object/define-property");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports["default"] = void 0;

var _lodash = _interopRequireDefault(require("lodash"));

/**
 * Choose a single property type given an array of possible values.  In the simplest
 * and usual case, a property only has one possible type, and so it will get assigned
 * that.  But we have to handle situations where a property can be a long or an int,
 * depending on value, etc.
 * @param {Object} property a property object from OKAPI schema information
 * @returns String a single type name.
 */
var chooseGraphQLType = function chooseGraphQLType(property) {
  var options = _lodash["default"].get(property, 'propertyTypes');

  var mandatoryModifier = _lodash["default"].get(property, 'mandatory') ? '!' : ''; // This stores and performs the mapping of a primitive Neo4j type t
  // to a GraphQL primitive type (the output)

  var mapSingleType = function mapSingleType(t) {
    var mapping = {
      // Primitives
      Long: 'Int',
      Float: 'Float',
      Double: 'Float',
      Integer: 'Int',
      String: 'String',
      Boolean: 'Boolean',
      Date: 'Date',
      DateTime: 'DateTime',
      LocalTime: 'LocalTime',
      LocalDateTime: 'LocalDateTime',
      Time: 'Time',
      Point: 'Point',
      // Array types
      LongArray: '[Int]',
      DoubleArray: '[Float]',
      FloatArray: '[Float]',
      IntegerArray: '[Int]',
      BooleanArray: '[Boolean]',
      StringArray: '[String]',
      DateArray: '[Date]',
      DateTimeArray: '[DateTime]',
      TimeArray: '[Time]',
      LocalTimeArray: '[LocalTime]',
      LocalDateTimeArray: '[LocalDateTime]',
      PointArray: '[Point]'
    };
    return mapping[t] || 'String';
  };

  if (!options || options.length === 0) {
    return 'String' + mandatoryModifier;
  }

  if (options.length === 1) {
    return mapSingleType(options[0]) + mandatoryModifier;
  }

  var has = function has(set, item) {
    return set.indexOf(item) !== -1;
  };

  return mapSingleType(options.filter(function (a) {
    return a;
  }).reduce(function (a, b) {
    // Comparator function: always pick the broader of the two types.
    if (!a || !b) {
      return a || b;
    }

    if (a === b) {
      return a;
    }

    var set = [a, b]; // String's generality dominates everything else.

    if (has(set, 'String')) {
      return 'String';
    } // Types form a partial ordering/lattice.  Some combinations are
    // nonsense and aren't specified, for example Long vs. Boolean.
    // In the nonsense cases, you get String at the bottom.
    // Basically, inconsistently typed neo4j properties are a **problem**,
    // and you shouldn't have them.
    // Only a few pairwise combinations make sense...


    if (has(set, 'Long') && has(set, 'Integer')) {
      return 'Long';
    }

    if (has(set, 'Integer') && has(set, 'Float')) {
      return 'Float';
    }

    return 'String';
  }, null)) + mandatoryModifier;
};

var label2GraphQLType = function label2GraphQLType(label) {
  if (_lodash["default"].isNil(label)) {
    throw new Error('Cannot convert nil label to GraphQL type');
  }

  return label.replace(/[ :]/g, '_');
};

var _default = {
  chooseGraphQLType: chooseGraphQLType,
  label2GraphQLType: label2GraphQLType
};
exports["default"] = _default;