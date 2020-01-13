"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs2/helpers/interopRequireDefault");

var _stringify = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/json/stringify"));

var _keys = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/keys"));

var _lodash = _interopRequireDefault(require("lodash"));

// OKAPI formats it as ':`Foo`' and we want 'Foo'
var extractRelationshipType = function extractRelationshipType(relTypeName) {
  return relTypeName.substring(2, relTypeName.length - 1);
};

var generateGraphQLTypeForTreeEntry = function generateGraphQLTypeForTreeEntry(tree, key) {
  var entry = tree.getNode(key);
  var propNames = (0, _keys["default"])(entry);
  var graphqlTypeName = key.replace(/:/g, '_');
  var typeDeclaration = "type ".concat(graphqlTypeName, " {\n");
  var propertyDeclarations = propNames.map(function (propName) {
    return "   ".concat(propName, ": ").concat(entry[propName].graphQLType, "\n");
  });
  var labels = key.split(/:/); // For these labels, figure out which rels are outbound from any member label.
  // That is, if your node is :Foo:Bar, any rel outbound from just Foo counts.

  var relDeclarations = _lodash["default"].flatten(labels.map(function (label) {
    var inbound = lookupInboundRels(tree, label);
    var outbound = lookupOutboundRels(tree, label);

    var relIds = _lodash["default"].uniq(inbound.concat(outbound));

    return relIds.map(function (relId) {
      // Create a copy of the links to/from this label.
      var links = _lodash["default"].cloneDeep(tree.rels[relId].links.filter(function (link) {
        return link.from.indexOf(label) > -1 || link.to.indexOf(label) > -1;
      })).map(function (link) {
        if (link.from.indexOf(label) > -1) {
          _lodash["default"].set(link, 'direction', 'OUT');
        } else {
          _lodash["default"].set(link, 'direction', 'IN');
        }
      }); // OUT relationships first.  Get their 'to' labels and generate.


      var allTargetLabels = _lodash["default"].uniq(_lodash["default"].flatten(links.filter(function (l) {
        return l.direction === 'OUT';
      }).map(function (link) {
        return link.to;
      })));

      if (allTargetLabels.length > 1) {
        // If a relationship (:A)-[:relType]->(x) where
        // x has multiple different labels, we can't express this as a type in
        // GraphQL.
        console.warn("RelID ".concat(relId, " for label ").concat(label, " has more than one outbound type (").concat(allTargetLabels, "); skipping"));
        return null;
      }

      var tag = "@relation(name: \"".concat(extractRelationshipType(relId), "\", direction: \"OUT\")");
      var targetTypeName = allTargetLabels[0];
      return "   ".concat(targetTypeName.toLowerCase(), "s: [").concat(targetTypeName, "] ").concat(tag, "\n");
    });
  }));

  return typeDeclaration + propertyDeclarations.join('') + relDeclarations.join('') + '}\n';
};
/**
 * Determine which relationships are outbound from a label under a schema tree.
 * @param {*} tree a schema tree
 * @param {*} label a graph label
 * @returns {Array} of relationship IDs
 */


var lookupOutboundRels = function lookupOutboundRels(tree, label) {
  return (0, _keys["default"])(tree.rels).filter(function (relId) {
    return tree.rels[relId].links && tree.rels[relId].links.filter(function (link) {
      return link.from.indexOf(label) !== -1;
    }).length > 0;
  });
};

var lookupInboundRels = function lookupInboundRels(tree, label) {
  return (0, _keys["default"])(tree.rels).filter(function (relId) {
    return tree.rels[relId].links && tree.rels[relId].links.filter(function (link) {
      return link.to.indexOf(label) !== -1;
    }).length > 0;
  });
};

var schemaTreeToGraphQLSchema = function schemaTreeToGraphQLSchema(tree) {
  console.log('TREE ', (0, _stringify["default"])(tree.toJSON(), null, 2));
  var nodeTypes = (0, _keys["default"])(tree.nodes).map(function (key) {
    return generateGraphQLTypeForTreeEntry(tree, key);
  });
  var schema = nodeTypes.join('\n');
  return schema;
};