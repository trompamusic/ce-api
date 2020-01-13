"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs2/helpers/interopRequireDefault");

var _Object$defineProperty = require("@babel/runtime-corejs2/core-js/object/define-property");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports["default"] = void 0;

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/toConsumableArray"));

var _set = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/set"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/getPrototypeOf"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/inherits"));

var _keys = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/keys"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/createClass"));

var _lodash = _interopRequireDefault(require("lodash"));

/**
 * Base class for a schema entity derived from Neo4j
 */
var Neo4jSchemaEntity =
/*#__PURE__*/
function () {
  function Neo4jSchemaEntity(id, type) {
    var properties = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    (0, _classCallCheck2["default"])(this, Neo4jSchemaEntity);
    this.id = id;
    this.type = type;
    this.properties = properties;
  }

  (0, _createClass2["default"])(Neo4jSchemaEntity, [{
    key: "asJSON",
    value: function asJSON() {
      return {
        id: this.id,
        type: this.type,
        properties: this.properties
      };
    }
  }, {
    key: "getGraphQLTypeName",
    value: function getGraphQLTypeName() {
      throw new Error('Override me in subclass');
    }
  }, {
    key: "getPropertyNames",
    value: function getPropertyNames() {
      return (0, _keys["default"])(this.properties).sort();
    }
  }, {
    key: "hasProperties",
    value: function hasProperties() {
      return this.getPropertyNames().length > 0;
    }
  }, {
    key: "getProperty",
    value: function getProperty(name) {
      return this.properties[name];
    }
  }, {
    key: "addProperty",
    value: function addProperty(name, details) {
      if (_lodash["default"].isNil(name) || _lodash["default"].isNil(details)) {
        throw new Error('Property must have both name and details');
      }

      _lodash["default"].set(this.properties, name, details);

      return this;
    }
  }]);
  return Neo4jSchemaEntity;
}();

var Neo4jNode =
/*#__PURE__*/
function (_Neo4jSchemaEntity) {
  (0, _inherits2["default"])(Neo4jNode, _Neo4jSchemaEntity);

  function Neo4jNode(id) {
    (0, _classCallCheck2["default"])(this, Neo4jNode);
    return (0, _possibleConstructorReturn2["default"])(this, (0, _getPrototypeOf2["default"])(Neo4jNode).call(this, id, 'node', {}));
  }

  (0, _createClass2["default"])(Neo4jNode, [{
    key: "getGraphQLTypeName",
    value: function getGraphQLTypeName() {
      // Make sure to guarantee alphabetic consistent ordering.
      var parts = this.getLabels();
      return parts.join('_').replace(/ /g, '_');
    }
  }, {
    key: "getLabels",
    value: function getLabels() {
      return this.id.split(/:/g).sort();
    }
  }]);
  return Neo4jNode;
}(Neo4jSchemaEntity);

var Neo4jRelationship =
/*#__PURE__*/
function (_Neo4jSchemaEntity2) {
  (0, _inherits2["default"])(Neo4jRelationship, _Neo4jSchemaEntity2);

  function Neo4jRelationship(id) {
    (0, _classCallCheck2["default"])(this, Neo4jRelationship);
    return (0, _possibleConstructorReturn2["default"])(this, (0, _getPrototypeOf2["default"])(Neo4jRelationship).call(this, id, 'relationship', {}));
  }

  (0, _createClass2["default"])(Neo4jRelationship, [{
    key: "getRelationshipType",
    value: function getRelationshipType() {
      // OKAPI returns okapi IDs as :`TYPENAME`
      return this.id.substring(2, this.id.length - 1);
    }
  }, {
    key: "getGraphQLTypeName",
    value: function getGraphQLTypeName() {
      return this.getRelationshipType().replace(/ /g, '_');
    }
    /**
     * A univalent relationship is one that connects exactly one type of node label to exactly one type of
     * other node label.  Imagine you have (:Customer)-[:BUYS]->(:Product).  In this case, BUYS is univalent
     * because it always connects from:Customer to:Product.
     *
     * If you had a graph which was (:Customer)-[:BUYS]->(:Product), (:Company)-[:BUYS]->(:Product) then
     * the BUYS relationship would be multivalent because it connects [Customer, Company] -> [Product].
     *
     * Important note, since nodes can have multiple labels, you could end up in a situation where
     * (:A:B)-[:WHATEVER]->(:C:D).  This is still univalent, because WHATEVER always connects things which
     * are all of :A:B to those that are all of :C:D.   If you had this situation:
     * (:A:B)-[:WHATEVER]->(:C:D) and then (:A)-[:WHATEVER]->(:C) this is not univalent.
     */

  }, {
    key: "isUnivalent",
    value: function isUnivalent() {
      return this.links && this.links.length === 1 // Length of links[0].from and to doesn't matter, as label combinations may be in use.
      ;
    }
  }, {
    key: "isInboundTo",
    value: function isInboundTo(label) {
      var _this = this;

      var comparisonSet = this._setify(label);

      var linksToThisLabel = this.links.filter(function (link) {
        var hereToSet = new _set["default"](link.to);

        var intersection = _this._setIntersection(comparisonSet, hereToSet);

        return intersection.size === comparisonSet.size;
      });
      return linksToThisLabel.length > 0;
    }
  }, {
    key: "_setify",
    value: function _setify(thing) {
      return new _set["default"](_lodash["default"].isArray(thing) ? thing : [thing]);
    }
  }, {
    key: "_setIntersection",
    value: function _setIntersection(a, b) {
      return new _set["default"]((0, _toConsumableArray2["default"])(a).filter(function (x) {
        return b.has(x);
      }));
    }
    /**
     * Returns true if the relationship is outbound from a label or set of labels.
     * @param {*} label a single label or array of labels.
     */

  }, {
    key: "isOutboundFrom",
    value: function isOutboundFrom(label) {
      var _this2 = this;

      var comparisonSet = this._setify(label);

      var linksFromThisLabelSet = this.links.filter(function (link) {
        var hereFromSet = new _set["default"](link.from);

        var intersection = _this2._setIntersection(comparisonSet, hereFromSet);

        return intersection.size === comparisonSet.size;
      });
      return linksFromThisLabelSet.length > 0;
    }
  }, {
    key: "getToLabels",
    value: function getToLabels() {
      return _lodash["default"].uniq(_lodash["default"].flatten(this.links.map(function (l) {
        return l.to;
      }))).sort();
    }
  }, {
    key: "getFromLabels",
    value: function getFromLabels() {
      return _lodash["default"].uniq(_lodash["default"].flatten(this.links.map(function (l) {
        return l.from;
      }))).sort();
    }
  }]);
  return Neo4jRelationship;
}(Neo4jSchemaEntity);

var _default = {
  Neo4jSchemaEntity: Neo4jSchemaEntity,
  Neo4jNode: Neo4jNode,
  Neo4jRelationship: Neo4jRelationship
};
exports["default"] = _default;