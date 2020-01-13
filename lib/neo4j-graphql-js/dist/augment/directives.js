"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs2/helpers/interopRequireDefault");

var _Object$defineProperty2 = require("@babel/runtime-corejs2/core-js/object/define-property");

_Object$defineProperty2(exports, "__esModule", {
  value: true
});

exports.getDirectiveArgument = exports.getDirective = exports.getRelationName = exports.getRelationDirection = exports.useAuthDirective = exports.buildAuthScopeDirective = exports.buildMutationMetaDirective = exports.buildRelationDirective = exports.augmentDirectiveDefinitions = exports.isIgnoredField = exports.isCypherField = exports.DirectiveDefinition = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/define-property"));

var _defineProperties = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/define-properties"));

var _getOwnPropertyDescriptors = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/get-own-property-descriptors"));

var _getOwnPropertyDescriptor = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/get-own-property-descriptor"));

var _getOwnPropertySymbols = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/get-own-property-symbols"));

var _keys = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/keys"));

var _typeof2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/typeof"));

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/slicedToArray"));

var _defineProperty3 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/defineProperty"));

var _entries = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/entries"));

var _graphql = require("graphql");

var _fields = require("./fields");

var _ast = require("./ast");

var _AuthDirectiveDefinit, _directiveDefinitionB;

function ownKeys(object, enumerableOnly) { var keys = (0, _keys["default"])(object); if (_getOwnPropertySymbols["default"]) { var symbols = (0, _getOwnPropertySymbols["default"])(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return (0, _getOwnPropertyDescriptor["default"])(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty3["default"])(target, key, source[key]); }); } else if (_getOwnPropertyDescriptors["default"]) { (0, _defineProperties["default"])(target, (0, _getOwnPropertyDescriptors["default"])(source)); } else { ownKeys(Object(source)).forEach(function (key) { (0, _defineProperty2["default"])(target, key, (0, _getOwnPropertyDescriptor["default"])(source, key)); }); } } return target; }

/**
 * An enum describing the names of directive definitions and instances
 * used by this integration
 */
var DirectiveDefinition = {
  CYPHER: 'cypher',
  RELATION: 'relation',
  MUTATION_META: 'MutationMeta',
  NEO4J_IGNORE: 'neo4j_ignore',
  IS_AUTHENTICATED: 'isAuthenticated',
  HAS_ROLE: 'hasRole',
  HAS_SCOPE: 'hasScope',
  ADDITIONAL_LABELS: 'additionalLabels'
}; // The name of Role type used in authorization logic

exports.DirectiveDefinition = DirectiveDefinition;
var ROLE_TYPE = 'Role';
/**
 * Enum for the names of directed fields on relationship types
 */

var RelationshipDirectionField = {
  FROM: 'from',
  TO: 'to'
};
/**
 * A predicate function for cypher directive fields
 */

var isCypherField = function isCypherField(_ref) {
  var _ref$directives = _ref.directives,
      directives = _ref$directives === void 0 ? [] : _ref$directives;
  return getDirective({
    directives: directives,
    name: DirectiveDefinition.CYPHER
  });
};
/**
 * A predicate function for neo4j_ignore directive fields
 */


exports.isCypherField = isCypherField;

var isIgnoredField = function isIgnoredField(_ref2) {
  var _ref2$directives = _ref2.directives,
      directives = _ref2$directives === void 0 ? [] : _ref2$directives;
  return getDirective({
    directives: directives,
    name: DirectiveDefinition.NEO4J_IGNORE
  });
};
/**
 * The main export for augmenting directive definitions
 */


exports.isIgnoredField = isIgnoredField;

var augmentDirectiveDefinitions = function augmentDirectiveDefinitions(_ref3) {
  var _ref3$typeDefinitionM = _ref3.typeDefinitionMap,
      typeDefinitionMap = _ref3$typeDefinitionM === void 0 ? {} : _ref3$typeDefinitionM,
      _ref3$directiveDefini = _ref3.directiveDefinitionMap,
      directiveDefinitionMap = _ref3$directiveDefini === void 0 ? {} : _ref3$directiveDefini,
      _ref3$config = _ref3.config,
      config = _ref3$config === void 0 ? {} : _ref3$config;
  // For each directive definition used by the integration
  (0, _entries["default"])(_objectSpread({}, directiveDefinitionBuilderMap, {}, AuthDirectiveDefinitionMap)).forEach(function (_ref4) {
    var _ref5 = (0, _slicedToArray2["default"])(_ref4, 2),
        name = _ref5[0],
        buildDefinition = _ref5[1];

    // If directive definition not provided
    if (!directiveDefinitionMap[name]) {
      // Try to build a config object for building the definition
      // AST node for this directive
      var astNodeConfig = buildDefinition({
        typeDefinitionMap: typeDefinitionMap,
        config: config
      });

      if (astNodeConfig) {
        if (astNodeConfig.args) {
          astNodeConfig.args = astNodeConfig.args.map(function (arg) {
            return (0, _ast.buildInputValue)({
              name: (0, _ast.buildName)({
                name: arg.name
              }),
              type: (0, _ast.buildNamedType)(arg.type)
            });
          });
        } // Build and map a new AST node for this directive


        directiveDefinitionMap[name] = (0, _ast.buildDirectiveDefinition)({
          name: (0, _ast.buildName)({
            name: name
          }),
          args: astNodeConfig.args,
          locations: astNodeConfig.locations.map(function (name) {
            return (0, _ast.buildName)({
              name: name
            });
          })
        });
      }
    }
  });
  var relationshipDirectionEnumName = '_RelationDirections';
  typeDefinitionMap[relationshipDirectionEnumName] = (0, _ast.buildEnumType)({
    name: (0, _ast.buildName)({
      name: relationshipDirectionEnumName
    }),
    values: [(0, _ast.buildEnumValue)({
      name: (0, _ast.buildName)({
        name: 'IN'
      })
    }), (0, _ast.buildEnumValue)({
      name: (0, _ast.buildName)({
        name: 'OUT'
      })
    })]
  });
  return [typeDefinitionMap, directiveDefinitionMap];
};
/**
 * Builds a relation directive for generated relationship output types
 */


exports.augmentDirectiveDefinitions = augmentDirectiveDefinitions;

var buildRelationDirective = function buildRelationDirective(_ref6) {
  var relationshipName = _ref6.relationshipName,
      fromType = _ref6.fromType,
      toType = _ref6.toType;
  return (0, _ast.buildDirective)({
    name: (0, _ast.buildName)({
      name: DirectiveDefinition.RELATION
    }),
    args: [(0, _ast.buildDirectiveArgument)({
      name: (0, _ast.buildName)({
        name: 'name'
      }),
      value: {
        kind: _graphql.Kind.STRING,
        value: relationshipName
      }
    }), (0, _ast.buildDirectiveArgument)({
      name: (0, _ast.buildName)({
        name: RelationshipDirectionField.FROM
      }),
      value: {
        kind: _graphql.Kind.STRING,
        value: fromType
      }
    }), (0, _ast.buildDirectiveArgument)({
      name: (0, _ast.buildName)({
        name: RelationshipDirectionField.TO
      }),
      value: {
        kind: _graphql.Kind.STRING,
        value: toType
      }
    })]
  });
};
/**
 * Builds a MutationMeta directive for translating relationship mutations
 */


exports.buildRelationDirective = buildRelationDirective;

var buildMutationMetaDirective = function buildMutationMetaDirective(_ref7) {
  var relationshipName = _ref7.relationshipName,
      fromType = _ref7.fromType,
      toType = _ref7.toType;
  return (0, _ast.buildDirective)({
    name: (0, _ast.buildName)({
      name: DirectiveDefinition.MUTATION_META
    }),
    args: [(0, _ast.buildDirectiveArgument)({
      name: (0, _ast.buildName)({
        name: 'relationship'
      }),
      value: {
        kind: _graphql.Kind.STRING,
        value: relationshipName
      }
    }), (0, _ast.buildDirectiveArgument)({
      name: (0, _ast.buildName)({
        name: RelationshipDirectionField.FROM
      }),
      value: {
        kind: _graphql.Kind.STRING,
        value: fromType
      }
    }), (0, _ast.buildDirectiveArgument)({
      name: (0, _ast.buildName)({
        name: RelationshipDirectionField.TO
      }),
      value: {
        kind: _graphql.Kind.STRING,
        value: toType
      }
    })]
  });
};
/**
 * Builds the hasScope directive used in API authorization logic
 */


exports.buildMutationMetaDirective = buildMutationMetaDirective;

var buildAuthScopeDirective = function buildAuthScopeDirective(_ref8) {
  var _ref8$scopes = _ref8.scopes,
      scopes = _ref8$scopes === void 0 ? [] : _ref8$scopes;
  return (0, _ast.buildDirective)({
    name: (0, _ast.buildName)({
      name: DirectiveDefinition.HAS_SCOPE
    }),
    args: [(0, _ast.buildDirectiveArgument)({
      name: (0, _ast.buildName)({
        name: 'scopes'
      }),
      value: {
        kind: _graphql.Kind.LIST,
        values: scopes.map(function (scope) {
          return {
            kind: _graphql.Kind.STRING,
            value: "".concat(scope.typeName, ": ").concat(scope.mutation)
          };
        })
      }
    })]
  });
};
/**
 * A map of the AST configurations for directive definitions
 * used in API authorization logic
 */


exports.buildAuthScopeDirective = buildAuthScopeDirective;
var AuthDirectiveDefinitionMap = (_AuthDirectiveDefinit = {}, (0, _defineProperty3["default"])(_AuthDirectiveDefinit, DirectiveDefinition.IS_AUTHENTICATED, function (_ref9) {
  var config = _ref9.config;

  if (useAuthDirective(config, DirectiveDefinition.IS_AUTHENTICATED)) {
    return {
      name: DirectiveDefinition.IS_AUTHENTICATED,
      locations: [_graphql.DirectiveLocation.OBJECT, _graphql.DirectiveLocation.FIELD_DEFINITION]
    };
  }
}), (0, _defineProperty3["default"])(_AuthDirectiveDefinit, DirectiveDefinition.HAS_ROLE, function (_ref10) {
  var typeDefinitionMap = _ref10.typeDefinitionMap,
      config = _ref10.config;

  if (useAuthDirective(config, DirectiveDefinition.HAS_ROLE)) {
    var roleEnumType = typeDefinitionMap[ROLE_TYPE];
    if (!roleEnumType) throw new Error("A Role enum type is required for the @hasRole auth directive.");
    if (roleEnumType && roleEnumType.kind !== _graphql.Kind.ENUM_TYPE_DEFINITION) throw new Error("The Role type must be an Enum type");
    return {
      name: DirectiveDefinition.HAS_ROLE,
      args: [{
        name: 'roles',
        type: {
          name: ROLE_TYPE,
          wrappers: (0, _defineProperty3["default"])({}, _fields.TypeWrappers.LIST_TYPE, true)
        }
      }],
      locations: [_graphql.DirectiveLocation.OBJECT, _graphql.DirectiveLocation.FIELD_DEFINITION]
    };
  }
}), (0, _defineProperty3["default"])(_AuthDirectiveDefinit, DirectiveDefinition.HAS_SCOPE, function (_ref11) {
  var config = _ref11.config;

  if (useAuthDirective(config, DirectiveDefinition.HAS_SCOPE)) {
    return {
      name: DirectiveDefinition.HAS_SCOPE,
      args: [{
        name: 'scopes',
        type: {
          name: _graphql.GraphQLString,
          wrappers: (0, _defineProperty3["default"])({}, _fields.TypeWrappers.LIST_TYPE, true)
        }
      }],
      locations: [_graphql.DirectiveLocation.OBJECT, _graphql.DirectiveLocation.FIELD_DEFINITION]
    };
  }
}), _AuthDirectiveDefinit);
/**
 * Map of AST configs for ASTNodeBuilder
 */

var directiveDefinitionBuilderMap = (_directiveDefinitionB = {}, (0, _defineProperty3["default"])(_directiveDefinitionB, DirectiveDefinition.CYPHER, function (_ref12) {
  var config = _ref12.config;
  return {
    name: DirectiveDefinition.CYPHER,
    args: [{
      name: 'statement',
      type: {
        name: _graphql.GraphQLString
      }
    }],
    locations: [_graphql.DirectiveLocation.FIELD_DEFINITION]
  };
}), (0, _defineProperty3["default"])(_directiveDefinitionB, DirectiveDefinition.RELATION, function (_ref13) {
  var config = _ref13.config;
  return {
    name: DirectiveDefinition.RELATION,
    args: [{
      name: 'name',
      type: {
        name: _graphql.GraphQLString
      }
    }, {
      name: 'direction',
      type: {
        name: '_RelationDirections'
      }
    }, {
      name: RelationshipDirectionField.FROM,
      type: {
        name: _graphql.GraphQLString
      }
    }, {
      name: RelationshipDirectionField.TO,
      type: {
        name: _graphql.GraphQLString
      }
    }],
    locations: [_graphql.DirectiveLocation.FIELD_DEFINITION, _graphql.DirectiveLocation.OBJECT]
  };
}), (0, _defineProperty3["default"])(_directiveDefinitionB, DirectiveDefinition.ADDITIONAL_LABELS, function (_ref14) {
  var config = _ref14.config;
  return {
    name: DirectiveDefinition.ADDITIONAL_LABELS,
    args: [{
      name: 'labels',
      type: {
        name: _graphql.GraphQLString,
        wrappers: (0, _defineProperty3["default"])({}, _fields.TypeWrappers.LIST_TYPE, true)
      }
    }],
    locations: [_graphql.DirectiveLocation.OBJECT]
  };
}), (0, _defineProperty3["default"])(_directiveDefinitionB, DirectiveDefinition.MUTATION_META, function (_ref15) {
  var config = _ref15.config;
  return {
    name: DirectiveDefinition.MUTATION_META,
    args: [{
      name: 'relationship',
      type: {
        name: _graphql.GraphQLString
      }
    }, {
      name: RelationshipDirectionField.FROM,
      type: {
        name: _graphql.GraphQLString
      }
    }, {
      name: RelationshipDirectionField.TO,
      type: {
        name: _graphql.GraphQLString
      }
    }],
    locations: [_graphql.DirectiveLocation.FIELD_DEFINITION]
  };
}), (0, _defineProperty3["default"])(_directiveDefinitionB, DirectiveDefinition.NEO4J_IGNORE, function (_ref16) {
  var config = _ref16.config;
  return {
    name: DirectiveDefinition.NEO4J_IGNORE,
    locations: [_graphql.DirectiveLocation.FIELD_DEFINITION]
  };
}), _directiveDefinitionB);
/**
 * Predicate function for deciding whether to a given directive
 */

var useAuthDirective = function useAuthDirective(config, authDirective) {
  if (config && (0, _typeof2["default"])(config) === 'object') {
    return config.auth === true || config && (0, _typeof2["default"])(config.auth) === 'object' && config.auth[authDirective] === true;
  }

  return false;
};
/**
 * Gets the direction argument of the relation field directive
 */


exports.useAuthDirective = useAuthDirective;

var getRelationDirection = function getRelationDirection(relationDirective) {
  var direction = {};

  try {
    direction = relationDirective.arguments.filter(function (a) {
      return a.name.value === 'direction';
    })[0];
    return direction.value.value;
  } catch (e) {
    // FIXME: should we ignore this error to define default behavior?
    throw new Error('No direction argument specified on @relation directive');
  }
};
/**
 * Gets the name argument of a relation directive
 */


exports.getRelationDirection = getRelationDirection;

var getRelationName = function getRelationName(relationDirective) {
  var name = {};

  try {
    name = relationDirective.arguments.filter(function (a) {
      return a.name.value === 'name';
    })[0];
    return name.value.value;
  } catch (e) {
    // FIXME: should we ignore this error to define default behavior?
    throw new Error('No name argument specified on @relation directive');
  }
};
/**
 * Gets a directive instance of a given name
 */


exports.getRelationName = getRelationName;

var getDirective = function getDirective(_ref17) {
  var directives = _ref17.directives,
      name = _ref17.name;
  return directives.find(function (directive) {
    return directive.name.value === name;
  });
};
/**
 * Gets an argument of a directive
 */


exports.getDirective = getDirective;

var getDirectiveArgument = function getDirectiveArgument(_ref18) {
  var directive = _ref18.directive,
      name = _ref18.name;
  var value = '';
  var arg = directive.arguments.find(function (arg) {
    return arg.name && arg.name.value === name;
  });

  if (arg) {
    value = arg.value.value;
  }

  return value;
};

exports.getDirectiveArgument = getDirectiveArgument;