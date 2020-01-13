"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs2/helpers/interopRequireDefault");

var _Object$defineProperty = require("@babel/runtime-corejs2/core-js/object/define-property");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports["default"] = void 0;

var _values = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/values"));

var _keys = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/keys"));

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/slicedToArray"));

var _promise = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/promise"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/createClass"));

var _lodash = _interopRequireDefault(require("lodash"));

var _entities = _interopRequireDefault(require("./entities"));

var _types = _interopRequireDefault(require("./types"));

var extractRelationshipType = function extractRelationshipType(relTypeName) {
  return relTypeName.substring(2, relTypeName.length - 1);
};

var withSession = function withSession(driver, f) {
  var s = driver.session();
  return f(s)["finally"](function () {
    return s.close();
  });
};
/**
 * This object harvests Neo4j schema information out of a running instance and organizes
 * it into a tree structure.
 *
 * Currently, it does this by using built-in Neo4j procedures (db.schema.nodeTypeProperties())
 * This approach has the drawback that it scans the entire database to make sure that the
 * resulting schema is complete and accurate, which can increase startup times and churn the
 * page cache, but guarantees 100% accurate results.
 *
 * TODO - in a future version, we will make the schema harvesting swappable for an APOC
 * approach that is based on sampling.
 */


var Neo4jSchemaTree =
/*#__PURE__*/
function () {
  // TODO: config is where method of generating metadata can be passed
  function Neo4jSchemaTree(driver) {
    var config = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    (0, _classCallCheck2["default"])(this, Neo4jSchemaTree);
    this.driver = driver;
    this.nodes = {};
    this.rels = {};
  }

  (0, _createClass2["default"])(Neo4jSchemaTree, [{
    key: "toJSON",
    value: function toJSON() {
      return {
        nodes: this.nodes,
        rels: this.rels
      };
    }
  }, {
    key: "initialize",
    value: function initialize() {
      var _this = this;

      var nodeTypeProperties = function nodeTypeProperties(session) {
        return session.run('CALL db.schema.nodeTypeProperties()').then(function (results) {
          return results.records.map(function (rec) {
            return rec.toObject();
          });
        });
      };

      var relTypeProperties = function relTypeProperties(session) {
        return session.run('CALL db.schema.relTypeProperties()').then(function (results) {
          return results.records.map(function (rec) {
            return rec.toObject();
          });
        });
      };

      console.log('Initializing your Neo4j Schema');
      console.log('This may take a few moments depending on the size of your DB');
      return _promise["default"].all([withSession(this.driver, nodeTypeProperties), withSession(this.driver, relTypeProperties)]).then(function (_ref) {
        var _ref2 = (0, _slicedToArray2["default"])(_ref, 2),
            nodeTypes = _ref2[0],
            relTypes = _ref2[1];

        return _this._populate(nodeTypes, relTypes);
      }).then(function () {
        return _this._populateRelationshipLinkTypes();
      }).then(function () {
        return _this;
      });
    }
  }, {
    key: "_populateRelationshipLinkTypes",
    value: function _populateRelationshipLinkTypes() {
      var _this2 = this;

      // console.log('Getting from/to relationship metadata');
      var okapiIds = (0, _keys["default"])(this.rels);
      var promises = okapiIds.map(function (okapiId) {
        var q = "\n                MATCH (n)-[r".concat(okapiId, "]->(m)\n                WITH n, r, m LIMIT 10\n                RETURN distinct(labels(n)) as from, labels(m) as to\n            ");
        return withSession(_this2.driver, function (s) {
          return s.run(q).then(function (results) {
            return results.records.map(function (r) {
              return r.toObject();
            });
          });
        }).then(function (rows) {
          _this2.getRel(okapiId).relType = extractRelationshipType(okapiId);
          _this2.getRel(okapiId).links = rows;
        });
      });
      return _promise["default"].all(promises).then(function () {
        return _this2;
      });
    }
  }, {
    key: "getNode",
    value: function getNode(id) {
      return this.nodes[id];
    }
  }, {
    key: "getNodes",
    value: function getNodes() {
      return (0, _values["default"])(this.nodes);
    }
    /**
     * @param {Array[String]} labels a set of labels
     * @returns {Neo4jNode} if it exists, null otherwise.
     */

  }, {
    key: "getNodeByLabels",
    value: function getNodeByLabels(labels) {
      var lookingFor = _lodash["default"].uniq(labels);

      var total = lookingFor.length;
      return this.getNodes().filter(function (n) {
        var here = n.getLabels();
        var matches = here.filter(function (label) {
          return lookingFor.indexOf(label) > -1;
        }).length;
        return matches === total;
      })[0];
    }
  }, {
    key: "getRel",
    value: function getRel(id) {
      return this.rels[id];
    }
  }, {
    key: "getRels",
    value: function getRels() {
      return (0, _values["default"])(this.rels);
    }
  }, {
    key: "_populate",
    value: function _populate(nodeTypes, relTypes) {
      var _this3 = this;

      // Process node types first
      _lodash["default"].uniq(nodeTypes.map(function (n) {
        return n.nodeType;
      })).forEach(function (nodeType) {
        // A node type is an OKAPI node type label, looks like ":`Event`"
        // Not terribly meaningful, but a grouping ID
        var labelCombos = _lodash["default"].uniq(nodeTypes.filter(function (i) {
          return i.nodeType === nodeType;
        }));

        labelCombos.forEach(function (item) {
          var combo = item.nodeLabels; // A label combination is an array of strings ["X", "Y"] which indicates
          // that some nodes ":X:Y" exist in the graph.

          var id = combo.join(':');
          var entity = _this3.nodes[id] || new _entities["default"].Neo4jNode(id);
          _this3.nodes[id] = entity; // Pick out only the property data for this label combination.

          nodeTypes.filter(function (i) {
            return i.nodeLabels === combo;
          }).map(function (i) {
            return _lodash["default"].pick(i, ['propertyName', 'propertyTypes', 'mandatory']);
          }).forEach(function (propDetail) {
            // console.log(schema);
            if (_lodash["default"].isNil(propDetail.propertyName)) {
              return;
            }

            propDetail.graphQLType = _types["default"].chooseGraphQLType(propDetail);
            entity.addProperty(propDetail.propertyName, propDetail);
          });
        });
      }); // Rel types


      _lodash["default"].uniq(relTypes.map(function (r) {
        return r.relType;
      })).forEach(function (relType) {
        var id = relType;
        var entity = _this3.rels[id] || new _entities["default"].Neo4jRelationship(id);
        _this3.rels[id] = entity;
        relTypes.filter(function (r) {
          return r.relType === relType;
        }).map(function (r) {
          return _lodash["default"].pick(r, ['propertyName', 'propertyTypes', 'mandatory']);
        }).forEach(function (propDetail) {
          if (_lodash["default"].isNil(propDetail.propertyName)) {
            return;
          }

          propDetail.graphQLType = _types["default"].chooseGraphQLType(propDetail);
          entity.addProperty(propDetail.propertyName, propDetail);
        });
      });
    }
  }]);
  return Neo4jSchemaTree;
}();

exports["default"] = Neo4jSchemaTree;