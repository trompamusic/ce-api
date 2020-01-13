"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs2/helpers/interopRequireDefault");

var _Object$defineProperty2 = require("@babel/runtime-corejs2/core-js/object/define-property");

_Object$defineProperty2(exports, "__esModule", {
  value: true
});

exports.parseArgs = parseArgs;
exports.extractSelections = extractSelections;
exports.extractQueryResult = extractQueryResult;
exports.typeIdentifiers = typeIdentifiers;
exports.cypherDirectiveArgs = cypherDirectiveArgs;
exports._isNamedMutation = _isNamedMutation;
exports.isMutation = isMutation;
exports.isGraphqlScalarType = isGraphqlScalarType;
exports.isGraphqlInterfaceType = isGraphqlInterfaceType;
exports.isArrayType = isArrayType;
exports.lowFirstLetter = lowFirstLetter;
exports.innerType = innerType;
exports.filtersFromSelections = filtersFromSelections;
exports.getFilterParams = getFilterParams;
exports.innerFilterParams = innerFilterParams;
exports.paramsToString = paramsToString;
exports.computeSkipLimit = computeSkipLimit;
exports.getDerivedTypeNames = exports.removeIgnoredFields = exports.getNeo4jTypeArguments = exports.neo4jTypePredicateClauses = exports.decideNeo4jTypeConstructor = exports.isSpatialDistanceInputType = exports.isSpatialInputType = exports.isSpatialField = exports.isSpatialType = exports.isTemporalInputType = exports.isTemporalField = exports.isTemporalType = exports.isNeo4jTypeInput = exports.isNeo4jTypeField = exports.isNeo4jType = exports.splitSelectionParameters = exports.filterNullParams = exports.getPayloadSelections = exports.getOuterSkipLimit = exports.initializeMutationParams = exports.decideNestedVariableName = exports.safeLabel = exports.safeVar = exports.getPrimaryKey = exports.getRelationTypeDirective = exports.getMutationCypherDirective = exports.getQueryCypherDirective = exports.getFieldDirective = exports.getTypeDirective = exports.relationDirective = exports.cypherDirective = exports.buildCypherParameters = exports.getAdditionalLabels = exports.getMutationArguments = exports.getQueryArguments = exports.possiblySetFirstId = exports.computeOrderBy = exports.isRootSelection = exports.isRelationTypePayload = exports.isNodeType = exports.isRelationTypeDirectedField = exports.isMergeMutation = exports.isRemoveMutation = exports.isDeleteMutation = exports.isUpdateMutation = exports.isAddMutation = exports.isCreateMutation = exports.parseDirectiveSdl = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/define-property"));

var _defineProperties = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/define-properties"));

var _getOwnPropertyDescriptors = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/get-own-property-descriptors"));

var _getOwnPropertyDescriptor = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/get-own-property-descriptor"));

var _getOwnPropertySymbols = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/get-own-property-symbols"));

var _values = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/values"));

var _defineProperty3 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/defineProperty"));

var _assign = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/assign"));

var _isInteger = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/number/is-integer"));

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/slicedToArray"));

var _entries = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/entries"));

var _stringify = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/json/stringify"));

var _keys = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/keys"));

var _isArray = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/array/is-array"));

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/toConsumableArray"));

var _parseFloat2 = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/parse-float"));

var _parseInt2 = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/parse-int"));

var _graphql = require("graphql");

var _neo4jDriver = _interopRequireDefault(require("neo4j-driver"));

var _lodash = _interopRequireDefault(require("lodash"));

var _filter = _interopRequireDefault(require("lodash/filter"));

var _types = require("./augment/types/types");

var _spatial = require("./augment/types/spatial");

var _fields = require("./augment/fields");

function ownKeys(object, enumerableOnly) { var keys = (0, _keys["default"])(object); if (_getOwnPropertySymbols["default"]) { var symbols = (0, _getOwnPropertySymbols["default"])(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return (0, _getOwnPropertyDescriptor["default"])(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty3["default"])(target, key, source[key]); }); } else if (_getOwnPropertyDescriptors["default"]) { (0, _defineProperties["default"])(target, (0, _getOwnPropertyDescriptors["default"])(source)); } else { ownKeys(Object(source)).forEach(function (key) { (0, _defineProperty2["default"])(target, key, (0, _getOwnPropertyDescriptor["default"])(source, key)); }); } } return target; }

function parseArg(arg, variableValues) {
  switch (arg.value.kind) {
    case 'IntValue':
      {
        return (0, _parseInt2["default"])(arg.value.value);
      }

    case 'FloatValue':
      {
        return (0, _parseFloat2["default"])(arg.value.value);
      }

    case 'Variable':
      {
        return variableValues[arg.value.name.value];
      }

    case 'ObjectValue':
      {
        return parseArgs(arg.value.fields, variableValues);
      }

    case 'ListValue':
      {
        return _lodash["default"].map(arg.value.values, function (value) {
          return parseArg({
            value: value
          }, variableValues);
        });
      }

    case 'NullValue':
      {
        return null;
      }

    default:
      {
        return arg.value.value;
      }
  }
}

function parseArgs(args, variableValues) {
  if (!args || args.length === 0) {
    return {};
  }

  return args.reduce(function (acc, arg) {
    acc[arg.name.value] = parseArg(arg, variableValues);
    return acc;
  }, {});
}

var parseDirectiveSdl = function parseDirectiveSdl(sdl) {
  return sdl ? (0, _graphql.parse)("type Type { field: String ".concat(sdl, " }")).definitions[0].fields[0].directives[0] : {};
};

exports.parseDirectiveSdl = parseDirectiveSdl;

function extractSelections(selections, fragments) {
  // extract any fragment selection sets into a single array of selections
  return selections.reduce(function (acc, cur) {
    if (cur.kind === 'FragmentSpread') {
      var recursivelyExtractedSelections = extractSelections(fragments[cur.name.value].selectionSet.selections, fragments);
      return [].concat((0, _toConsumableArray2["default"])(acc), (0, _toConsumableArray2["default"])(recursivelyExtractedSelections));
    } else {
      return [].concat((0, _toConsumableArray2["default"])(acc), [cur]);
    }
  }, []);
}

function extractQueryResult(_ref, returnType) {
  var records = _ref.records;

  var _typeIdentifiers = typeIdentifiers(returnType),
      variableName = _typeIdentifiers.variableName;

  var result = null;

  if (isArrayType(returnType)) {
    result = records.map(function (record) {
      return record.get(variableName);
    });
  } else if (records.length) {
    // could be object or scalar
    result = records[0].get(variableName);
    result = (0, _isArray["default"])(result) ? result[0] : result;
  } // handle Integer fields


  result = _lodash["default"].cloneDeepWith(result, function (field) {
    if (_neo4jDriver["default"].isInt(field)) {
      // See: https://neo4j.com/docs/api/javascript-driver/current/class/src/v1/integer.js~Integer.html
      return field.inSafeRange() ? field.toNumber() : field.toString();
    }
  });
  return result;
}

function typeIdentifiers(returnType) {
  var typeName = innerType(returnType).toString();
  return {
    variableName: lowFirstLetter(typeName),
    typeName: typeName
  };
}

function getDefaultArguments(fieldName, schemaType) {
  // get default arguments for this field from schema
  try {
    return schemaType._fields[fieldName].args.reduce(function (acc, arg) {
      acc[arg.name] = arg.defaultValue;
      return acc;
    }, {});
  } catch (err) {
    return {};
  }
}

function cypherDirectiveArgs(variable, headSelection, cypherParams, schemaType, resolveInfo, paramIndex) {
  // Get any default arguments or an empty object
  var defaultArgs = getDefaultArguments(headSelection.name.value, schemaType); // Set the $this parameter by default

  var args = ["this: ".concat(variable)]; // If cypherParams are provided, add the parameter

  if (cypherParams) args.push("cypherParams: $cypherParams"); // Parse field argument values

  var queryArgs = parseArgs(headSelection.arguments, resolveInfo.variableValues); // Add arguments that have default values, if no value is provided

  (0, _keys["default"])(defaultArgs).forEach(function (e) {
    // Use only if default value exists and no value has been provided
    if (defaultArgs[e] !== undefined && queryArgs[e] === undefined) {
      // Values are inlined
      var inlineDefaultValue = (0, _stringify["default"])(defaultArgs[e]);
      args.push("".concat(e, ": ").concat(inlineDefaultValue));
    }
  }); // Add arguments that have provided values

  (0, _keys["default"])(queryArgs).forEach(function (e) {
    if (queryArgs[e] !== undefined) {
      // Use only if value exists
      args.push("".concat(e, ": $").concat(paramIndex, "_").concat(e));
    }
  }); // Return the comma separated join of all param
  // strings, adding a comma to match current test formats

  return args.join(', ');
}

function _isNamedMutation(name) {
  return function (resolveInfo) {
    return isMutation(resolveInfo) && resolveInfo.fieldName.split(/(?=[A-Z])/)[0].toLowerCase() === name.toLowerCase();
  };
}

var isCreateMutation = _isNamedMutation('create');

exports.isCreateMutation = isCreateMutation;

var isAddMutation = _isNamedMutation('add');

exports.isAddMutation = isAddMutation;

var isUpdateMutation = _isNamedMutation('update');

exports.isUpdateMutation = isUpdateMutation;

var isDeleteMutation = _isNamedMutation('delete');

exports.isDeleteMutation = isDeleteMutation;

var isRemoveMutation = _isNamedMutation('remove');

exports.isRemoveMutation = isRemoveMutation;

var isMergeMutation = _isNamedMutation('merge');

exports.isMergeMutation = isMergeMutation;

var isRelationshipUpdateMutation = function isRelationshipUpdateMutation(_ref2) {
  var resolveInfo = _ref2.resolveInfo,
      mutationMeta = _ref2.mutationMeta;
  return isUpdateMutation(resolveInfo) && !mutationMeta;
};

var isRelationshipMergeMutation = function isRelationshipMergeMutation(_ref3) {
  var resolveInfo = _ref3.resolveInfo,
      mutationMeta = _ref3.mutationMeta;
  return isMergeMutation(resolveInfo) && !mutationMeta;
};

function isMutation(resolveInfo) {
  return resolveInfo.operation.operation === 'mutation';
}

function isGraphqlScalarType(type) {
  return type.constructor.name === 'GraphQLScalarType' || type.constructor.name === 'GraphQLEnumType';
}

function isGraphqlInterfaceType(type) {
  return type.constructor.name === 'GraphQLInterfaceType';
}

function isArrayType(type) {
  return type ? type.toString().startsWith('[') : false;
}

var isRelationTypeDirectedField = function isRelationTypeDirectedField(fieldName) {
  return fieldName === 'from' || fieldName === 'to';
};

exports.isRelationTypeDirectedField = isRelationTypeDirectedField;

var isNodeType = function isNodeType(astNode) {
  return astNode && // must be graphql object type
  astNode.kind === 'ObjectTypeDefinition' && // is not Query or Mutation type
  astNode.name.value !== 'Query' && astNode.name.value !== 'Mutation' && // does not have relation type directive
  getTypeDirective(astNode, 'relation') === undefined && // does not have from and to fields; not relation type
  astNode.fields && astNode.fields.find(function (e) {
    return e.name.value === 'from';
  }) === undefined && astNode.fields.find(function (e) {
    return e.name.value === 'to';
  }) === undefined;
};

exports.isNodeType = isNodeType;

var isRelationTypePayload = function isRelationTypePayload(schemaType) {
  var astNode = schemaType ? schemaType.astNode : undefined;
  var directive = astNode ? getRelationTypeDirective(astNode) : undefined;
  return astNode && astNode.fields && directive ? astNode.fields.find(function (e) {
    return e.name.value === directive.from || e.name.value === directive.to;
  }) : undefined;
};

exports.isRelationTypePayload = isRelationTypePayload;

var isRootSelection = function isRootSelection(_ref4) {
  var selectionInfo = _ref4.selectionInfo,
      rootType = _ref4.rootType;
  return selectionInfo && selectionInfo.rootType === rootType;
};

exports.isRootSelection = isRootSelection;

function lowFirstLetter(word) {
  return word.charAt(0).toLowerCase() + word.slice(1);
}

function innerType(type) {
  return type.ofType ? innerType(type.ofType) : type;
}

function filtersFromSelections(selections, variableValues) {
  if (selections && selections.length && selections[0].arguments && selections[0].arguments.length) {
    return selections[0].arguments.reduce(function (result, x) {
      (result[x.name.value] = argumentValue(selections[0], x.name.value, variableValues)) || x.value.value;
      return result;
    }, {});
  }

  return {};
}

function getFilterParams(filters, index) {
  return (0, _entries["default"])(filters).reduce(function (result, _ref5) {
    var _ref6 = (0, _slicedToArray2["default"])(_ref5, 2),
        key = _ref6[0],
        value = _ref6[1];

    result[key] = index ? {
      value: value,
      index: index
    } : value;
    return result;
  }, {});
}

function innerFilterParams(filters, neo4jTypeArgs, paramKey, cypherDirective) {
  var temporalArgNames = neo4jTypeArgs ? neo4jTypeArgs.reduce(function (acc, t) {
    acc.push(t.name.value);
    return acc;
  }, []) : []; // don't exclude first, offset, orderBy args for cypher directives

  var excludedKeys = cypherDirective ? [] : ['first', 'offset', 'orderBy', 'filter'];
  return (0, _keys["default"])(filters).length > 0 ? (0, _entries["default"])(filters) // exclude temporal arguments
  .filter(function (_ref7) {
    var _ref8 = (0, _slicedToArray2["default"])(_ref7, 1),
        key = _ref8[0];

    return ![].concat(excludedKeys, (0, _toConsumableArray2["default"])(temporalArgNames)).includes(key);
  }).map(function (_ref9) {
    var _ref10 = (0, _slicedToArray2["default"])(_ref9, 2),
        key = _ref10[0],
        value = _ref10[1];

    return {
      key: key,
      paramKey: paramKey,
      value: value
    };
  }) : [];
}

function paramsToString(params, cypherParams) {
  if (params.length > 0) {
    var strings = _lodash["default"].map(params, function (param) {
      return "".concat(param.key, ":").concat(param.paramKey ? "$".concat(param.paramKey, ".") : '$').concat(!param.value || typeof param.value.index === 'undefined' ? param.key : "".concat(param.value.index, "_").concat(param.key));
    });

    return "{".concat(strings.join(', ')).concat(cypherParams ? ", cypherParams: $cypherParams}" : '}');
  }

  return '';
}

function computeSkipLimit(selection, variableValues) {
  var first = argumentValue(selection, 'first', variableValues);
  var offset = argumentValue(selection, 'offset', variableValues);
  if (first === null && offset === null) return '';
  if (offset === null) return "[..".concat(first, "]");
  if (first === null) return "[".concat(offset, "..]");
  return "[".concat(offset, "..").concat((0, _parseInt2["default"])(offset) + (0, _parseInt2["default"])(first), "]");
}

function splitOrderByArg(orderByVar) {
  var splitIndex = orderByVar.lastIndexOf('_');
  var order = orderByVar.substring(splitIndex + 1);
  var orderBy = orderByVar.substring(0, splitIndex);
  return {
    orderBy: orderBy,
    order: order
  };
}

function orderByStatement(resolveInfo, _ref11) {
  var orderBy = _ref11.orderBy,
      order = _ref11.order;

  var _typeIdentifiers2 = typeIdentifiers(resolveInfo.returnType),
      variableName = _typeIdentifiers2.variableName;

  return " ".concat(variableName, ".").concat(orderBy, " ").concat(order === 'asc' ? 'ASC' : 'DESC', " ");
}

var computeOrderBy = function computeOrderBy(resolveInfo, schemaType) {
  var selection = resolveInfo.operation.selectionSet.selections[0];
  var orderByArgs = argumentValue(selection, 'orderBy', resolveInfo.variableValues);

  if (orderByArgs == undefined) {
    return {
      cypherPart: '',
      optimization: {
        earlyOrderBy: false
      }
    };
  }

  var orderByArray = (0, _isArray["default"])(orderByArgs) ? orderByArgs : [orderByArgs];
  var optimization = {
    earlyOrderBy: true
  };
  var orderByStatements = [];
  var orderByStatments = orderByArray.map(function (orderByVar) {
    var _splitOrderByArg = splitOrderByArg(orderByVar),
        orderBy = _splitOrderByArg.orderBy,
        order = _splitOrderByArg.order;

    var hasNoCypherDirective = _lodash["default"].isEmpty(cypherDirective(schemaType, orderBy));

    optimization.earlyOrderBy = optimization.earlyOrderBy && hasNoCypherDirective;
    orderByStatements.push(orderByStatement(resolveInfo, {
      orderBy: orderBy,
      order: order
    }));
  });
  return {
    cypherPart: " ORDER BY".concat(orderByStatements.join(',')),
    optimization: optimization
  };
};

exports.computeOrderBy = computeOrderBy;

var possiblySetFirstId = function possiblySetFirstId(_ref12) {
  var args = _ref12.args,
      _ref12$statements = _ref12.statements,
      statements = _ref12$statements === void 0 ? [] : _ref12$statements,
      params = _ref12.params;
  var arg = args.find(function (e) {
    return _getNamedType(e).name.value === 'ID';
  }); // arg is the first ID field if it exists, and we set the value
  // if no value is provided for the field name (arg.name.value) in params

  if (arg && arg.name.value && params[arg.name.value] === undefined) {
    statements.push("".concat(arg.name.value, ": apoc.create.uuid()"));
  }

  return statements;
};

exports.possiblySetFirstId = possiblySetFirstId;

var getQueryArguments = function getQueryArguments(resolveInfo) {
  if (resolveInfo.fieldName === '_entities') return [];
  return resolveInfo.schema.getQueryType().getFields()[resolveInfo.fieldName].astNode.arguments;
};

exports.getQueryArguments = getQueryArguments;

var getMutationArguments = function getMutationArguments(resolveInfo) {
  return resolveInfo.schema.getMutationType().getFields()[resolveInfo.fieldName].astNode.arguments;
};

exports.getMutationArguments = getMutationArguments;

var getAdditionalLabels = function getAdditionalLabels(schemaType, cypherParams) {
  var labelDirective = getTypeDirective(schemaType.astNode, 'additionalLabels');

  var _ref13 = labelDirective ? parseArgs(labelDirective.arguments) : {
    labels: []
  },
      rawLabels = _ref13.labels;

  var parsedLabels = rawLabels.map(function (label) {
    return _lodash["default"].template(label, {
      variable: '$cypherParams'
    })(cypherParams);
  });
  return parsedLabels;
};

exports.getAdditionalLabels = getAdditionalLabels;

var buildCypherParameters = function buildCypherParameters(_ref14) {
  var args = _ref14.args,
      _ref14$statements = _ref14.statements,
      statements = _ref14$statements === void 0 ? [] : _ref14$statements,
      params = _ref14.params,
      paramKey = _ref14.paramKey,
      resolveInfo = _ref14.resolveInfo;
  var dataParams = paramKey ? params[paramKey] : params;
  var paramKeys = dataParams ? (0, _keys["default"])(dataParams) : [];

  if (args) {
    statements = paramKeys.reduce(function (paramStatements, paramName) {
      var param = paramKey ? params[paramKey][paramName] : params[paramName]; // Get the AST definition for the argument matching this param name

      var fieldAst = args.find(function (arg) {
        return arg.name.value === paramName;
      });

      if (fieldAst) {
        var fieldType = _getNamedType(fieldAst.type);

        var fieldTypeName = fieldType.name.value;

        if (isNeo4jTypeInput(fieldTypeName)) {
          paramStatements = buildNeo4jTypeCypherParameters({
            paramStatements: paramStatements,
            params: params,
            param: param,
            paramKey: paramKey,
            paramName: paramName,
            fieldTypeName: fieldTypeName,
            resolveInfo: resolveInfo
          });
        } else {
          // normal case
          paramStatements.push("".concat(paramName, ":$").concat(paramKey ? "".concat(paramKey, ".") : '').concat(paramName));
        }
      }

      return paramStatements;
    }, statements);
  }

  if (paramKey) {
    params[paramKey] = dataParams;
  }

  return [params, statements];
};

exports.buildCypherParameters = buildCypherParameters;

var buildNeo4jTypeCypherParameters = function buildNeo4jTypeCypherParameters(_ref15) {
  var paramStatements = _ref15.paramStatements,
      params = _ref15.params,
      param = _ref15.param,
      paramKey = _ref15.paramKey,
      paramName = _ref15.paramName,
      fieldTypeName = _ref15.fieldTypeName,
      resolveInfo = _ref15.resolveInfo;
  var formatted = param.formatted;
  var neo4jTypeConstructor = decideNeo4jTypeConstructor(fieldTypeName);

  if (neo4jTypeConstructor) {
    // Prefer only using formatted, if provided
    if (formatted) {
      if (paramKey) params[paramKey][paramName] = formatted;else params[paramName] = formatted;
      paramStatements.push("".concat(paramName, ": ").concat(neo4jTypeConstructor, "($").concat(paramKey ? "".concat(paramKey, ".") : '').concat(paramName, ")"));
    } else {
      var neo4jTypeParam = {};

      if ((0, _isArray["default"])(param)) {
        var count = param.length;
        var paramIndex = 0;

        for (; paramIndex < count; ++paramIndex) {
          neo4jTypeParam = param[paramIndex];

          if (neo4jTypeParam.formatted) {
            var _formatted = neo4jTypeParam.formatted;
            if (paramKey) params[paramKey][paramName] = _formatted;else params[paramName] = _formatted;
          } else {
            params = serializeNeo4jIntegers({
              paramKey: paramKey,
              fieldTypeName: fieldTypeName,
              paramName: paramName,
              paramIndex: paramIndex,
              neo4jTypeParam: neo4jTypeParam,
              params: params,
              resolveInfo: resolveInfo
            });
          }
        }

        paramStatements.push("".concat(paramName, ": [value IN $").concat(paramKey ? "".concat(paramKey, ".") : '').concat(paramName, " | ").concat(neo4jTypeConstructor, "(value)]"));
      } else {
        if (paramKey) neo4jTypeParam = params[paramKey][paramName];else neo4jTypeParam = params[paramName];
        var _formatted2 = neo4jTypeParam.formatted;

        if (neo4jTypeParam.formatted) {
          if (paramKey) params[paramKey][paramName] = _formatted2;else params[paramName] = _formatted2;
        } else {
          params = serializeNeo4jIntegers({
            paramKey: paramKey,
            fieldTypeName: fieldTypeName,
            paramName: paramName,
            neo4jTypeParam: neo4jTypeParam,
            params: params,
            resolveInfo: resolveInfo
          });
        }

        paramStatements.push("".concat(paramName, ": ").concat(neo4jTypeConstructor, "($").concat(paramKey ? "".concat(paramKey, ".") : '').concat(paramName, ")"));
      }
    }
  }

  return paramStatements;
};

var serializeNeo4jIntegers = function serializeNeo4jIntegers(_ref16) {
  var paramKey = _ref16.paramKey,
      fieldTypeName = _ref16.fieldTypeName,
      paramName = _ref16.paramName,
      paramIndex = _ref16.paramIndex,
      _ref16$neo4jTypeParam = _ref16.neo4jTypeParam,
      neo4jTypeParam = _ref16$neo4jTypeParam === void 0 ? {} : _ref16$neo4jTypeParam,
      _ref16$params = _ref16.params,
      params = _ref16$params === void 0 ? {} : _ref16$params,
      resolveInfo = _ref16.resolveInfo;
  var schema = resolveInfo.schema;
  var neo4jTypeDefinition = schema.getType(fieldTypeName);
  var neo4jTypeAst = neo4jTypeDefinition.astNode;
  var neo4jTypeFields = neo4jTypeAst.fields;
  (0, _keys["default"])(neo4jTypeParam).forEach(function (paramFieldName) {
    var fieldAst = neo4jTypeFields.find(function (field) {
      return field.name.value === paramFieldName;
    });
    var unwrappedFieldType = (0, _fields.unwrapNamedType)({
      type: fieldAst.type
    });
    var fieldTypeName = unwrappedFieldType.name;

    if (fieldTypeName === _graphql.GraphQLInt.name && (0, _isInteger["default"])(neo4jTypeParam[paramFieldName])) {
      var serialized = _neo4jDriver["default"]["int"](neo4jTypeParam[paramFieldName]);

      var param = params[paramName];

      if (paramIndex >= 0) {
        if (paramKey) param = params[paramKey][paramName][paramIndex];else param = param[paramIndex];
      } else if (paramKey) param = params[paramKey][paramName];

      param[paramFieldName] = serialized;
    }
  });
  return params;
}; // TODO refactor to handle Query/Mutation type schema directives


var directiveWithArgs = function directiveWithArgs(directiveName, args) {
  return function (schemaType, fieldName) {
    function fieldDirective(schemaType, fieldName, directiveName) {
      return !isGraphqlScalarType(schemaType) ? schemaType.getFields() && schemaType.getFields()[fieldName] && schemaType.getFields()[fieldName].astNode.directives.find(function (e) {
        return e.name.value === directiveName;
      }) : {};
    }

    function directiveArgument(directive, name) {
      return directive && directive.arguments ? directive.arguments.find(function (e) {
        return e.name.value === name;
      }).value.value : [];
    }

    var directive = fieldDirective(schemaType, fieldName, directiveName);
    var ret = {};

    if (directive) {
      _assign["default"].apply(Object, [ret].concat((0, _toConsumableArray2["default"])(args.map(function (key) {
        return (0, _defineProperty3["default"])({}, key, directiveArgument(directive, key));
      }))));
    }

    return ret;
  };
};

var cypherDirective = directiveWithArgs('cypher', ['statement']);
exports.cypherDirective = cypherDirective;
var relationDirective = directiveWithArgs('relation', ['name', 'direction']);
exports.relationDirective = relationDirective;

var getTypeDirective = function getTypeDirective(relatedAstNode, name) {
  return relatedAstNode && relatedAstNode.directives ? relatedAstNode.directives.find(function (e) {
    return e.name.value === name;
  }) : undefined;
};

exports.getTypeDirective = getTypeDirective;

var getFieldDirective = function getFieldDirective(field, directive) {
  return field && field.directives && field.directives.find(function (e) {
    return e && e.name && e.name.value === directive;
  });
};

exports.getFieldDirective = getFieldDirective;

var getQueryCypherDirective = function getQueryCypherDirective(resolveInfo) {
  if (resolveInfo.fieldName === '_entities') return;
  return resolveInfo.schema.getQueryType().getFields()[resolveInfo.fieldName].astNode.directives.find(function (x) {
    return x.name.value === 'cypher';
  });
};

exports.getQueryCypherDirective = getQueryCypherDirective;

var getMutationCypherDirective = function getMutationCypherDirective(resolveInfo) {
  return resolveInfo.schema.getMutationType().getFields()[resolveInfo.fieldName].astNode.directives.find(function (x) {
    return x.name.value === 'cypher';
  });
};

exports.getMutationCypherDirective = getMutationCypherDirective;

function argumentValue(selection, name, variableValues) {
  var arg = selection.arguments.find(function (a) {
    return a.name.value === name;
  });

  if (!arg) {
    return null;
  } else {
    return parseArg(arg, variableValues);
  }
}

var getRelationTypeDirective = function getRelationTypeDirective(relationshipType) {
  var directive = relationshipType && relationshipType.directives ? relationshipType.directives.find(function (e) {
    return e.name.value === 'relation';
  }) : undefined;
  return directive ? {
    name: directive.arguments.find(function (e) {
      return e.name.value === 'name';
    }).value.value,
    from: directive.arguments.find(function (e) {
      return e.name.value === 'from';
    }).value.value,
    to: directive.arguments.find(function (e) {
      return e.name.value === 'to';
    }).value.value
  } : undefined;
};

exports.getRelationTypeDirective = getRelationTypeDirective;

var firstNonNullAndIdField = function firstNonNullAndIdField(fields) {
  var valueTypeName = '';
  return fields.find(function (e) {
    valueTypeName = _getNamedType(e).name.value;
    return e.name.value !== '_id' && e.type.kind === 'NonNullType' && valueTypeName === 'ID';
  });
};

var firstIdField = function firstIdField(fields) {
  var valueTypeName = '';
  return fields.find(function (e) {
    valueTypeName = _getNamedType(e).name.value;
    return e.name.value !== '_id' && valueTypeName === 'ID';
  });
};

var firstNonNullField = function firstNonNullField(fields) {
  var valueTypeName = '';
  return fields.find(function (e) {
    valueTypeName = _getNamedType(e).name.value;
    return valueTypeName === 'NonNullType';
  });
};

var firstField = function firstField(fields) {
  return fields.find(function (e) {
    return e.name.value !== '_id';
  });
};

var getPrimaryKey = function getPrimaryKey(astNode) {
  var fields = astNode.fields;
  var pk = undefined; // prevent ignored, relation, and computed fields
  // from being used as primary keys

  fields = fields.filter(function (field) {
    return !getFieldDirective(field, 'neo4j_ignore') && !getFieldDirective(field, 'relation') && !getFieldDirective(field, 'cypher');
  });
  if (!fields.length) return pk;
  pk = firstNonNullAndIdField(fields);

  if (!pk) {
    pk = firstIdField(fields);
  }

  if (!pk) {
    pk = firstNonNullField(fields);
  }

  if (!pk) {
    pk = firstField(fields);
  } // Do not allow Point primary key


  if (pk) {
    var type = pk.type;
    var unwrappedType = (0, _fields.unwrapNamedType)({
      type: type
    });
    var typeName = unwrappedType.name;

    if (isSpatialType(typeName) || typeName === _spatial.SpatialType.POINT) {
      pk = undefined;
    }
  }

  return pk;
};
/**
 * Render safe a variable name according to cypher rules
 * @param {String} i input variable name
 * @returns {String} escaped text suitable for interpolation in cypher
 */


exports.getPrimaryKey = getPrimaryKey;

var safeVar = function safeVar(i) {
  // There are rare cases where the var input is an object and has to be stringified
  // to produce the right output.
  var asStr = "".concat(i); // Rules: https://neo4j.com/docs/developer-manual/current/cypher/syntax/naming/

  return '`' + asStr.replace(/[-!$%^&*()_+|~=`{}\[\]:";'<>?,.\/]/g, '_') + '`';
};
/**
 * Render safe a label name by enclosing it in backticks and escaping any
 * existing backtick if present.
 * @param {String | String[]} a label name or an array of labels
 * @returns {String} an escaped label name suitable for cypher concat
 */


exports.safeVar = safeVar;

var safeLabel = function safeLabel(l) {
  if (!(0, _isArray["default"])(l)) {
    l = [l];
  }

  var safeLabels = l.map(function (label) {
    var asStr = "".concat(label);
    var escapeInner = asStr.replace(/\`/g, '\\`');
    return '`' + escapeInner + '`';
  });
  return safeLabels.join(':');
};

exports.safeLabel = safeLabel;

var decideNestedVariableName = function decideNestedVariableName(_ref18) {
  var schemaTypeRelation = _ref18.schemaTypeRelation,
      innerSchemaTypeRelation = _ref18.innerSchemaTypeRelation,
      variableName = _ref18.variableName,
      fieldName = _ref18.fieldName,
      parentSelectionInfo = _ref18.parentSelectionInfo;

  if (isRootSelection({
    selectionInfo: parentSelectionInfo,
    rootType: 'relationship'
  }) && isRelationTypeDirectedField(fieldName)) {
    return parentSelectionInfo[fieldName];
  } else if (schemaTypeRelation) {
    var fromTypeName = schemaTypeRelation.from;
    var toTypeName = schemaTypeRelation.to;

    if (fromTypeName === toTypeName) {
      if (fieldName === 'from' || fieldName === 'to') {
        return variableName + '_' + fieldName;
      } else {
        // Case of a reflexive relationship type's directed field
        // being renamed to its node type value
        // ex: from: User -> User: User
        return variableName;
      }
    }
  } else {
    // Types without @relation directives are assumed to be node types
    // and only node types can have fields whose values are relation types
    if (innerSchemaTypeRelation) {
      // innerSchemaType is a field payload type using a @relation directive
      if (innerSchemaTypeRelation.from === innerSchemaTypeRelation.to) {
        return variableName;
      }
    } else {
      // related types are different
      return variableName + '_' + fieldName;
    }
  }

  return variableName + '_' + fieldName;
};

exports.decideNestedVariableName = decideNestedVariableName;

var initializeMutationParams = function initializeMutationParams(_ref19) {
  var mutationMeta = _ref19.mutationMeta,
      resolveInfo = _ref19.resolveInfo,
      mutationTypeCypherDirective = _ref19.mutationTypeCypherDirective,
      otherParams = _ref19.otherParams,
      first = _ref19.first,
      offset = _ref19.offset;
  return (isCreateMutation(resolveInfo) || isRelationshipUpdateMutation({
    resolveInfo: resolveInfo,
    mutationMeta: mutationMeta
  }) || isRelationshipMergeMutation({
    resolveInfo: resolveInfo,
    mutationMeta: mutationMeta
  })) && !mutationTypeCypherDirective ? _objectSpread({
    params: otherParams
  }, {
    first: first,
    offset: offset
  }) : _objectSpread({}, otherParams, {}, {
    first: first,
    offset: offset
  });
};

exports.initializeMutationParams = initializeMutationParams;

var getOuterSkipLimit = function getOuterSkipLimit(first, offset) {
  return "".concat(offset > 0 ? " SKIP toInteger($offset)" : '').concat(first > -1 ? ' LIMIT toInteger($first)' : '');
};

exports.getOuterSkipLimit = getOuterSkipLimit;

var getPayloadSelections = function getPayloadSelections(resolveInfo) {
  var filteredFieldNodes = (0, _filter["default"])(resolveInfo.fieldNodes, function (n) {
    return n.name.value === resolveInfo.fieldName;
  });

  if (filteredFieldNodes[0] && filteredFieldNodes[0].selectionSet) {
    // FIXME: how to handle multiple fieldNode matches
    var x = extractSelections(filteredFieldNodes[0].selectionSet.selections, resolveInfo.fragments);
    return x;
  }

  return [];
};

exports.getPayloadSelections = getPayloadSelections;

var filterNullParams = function filterNullParams(_ref20) {
  var offset = _ref20.offset,
      first = _ref20.first,
      otherParams = _ref20.otherParams;
  return (0, _entries["default"])(_objectSpread({}, {
    offset: offset,
    first: first
  }, {}, otherParams)).reduce(function (_ref21, _ref22) {
    var _ref23 = (0, _slicedToArray2["default"])(_ref21, 2),
        nulls = _ref23[0],
        nonNulls = _ref23[1];

    var _ref24 = (0, _slicedToArray2["default"])(_ref22, 2),
        key = _ref24[0],
        value = _ref24[1];

    if (value === null) {
      nulls[key] = value;
    } else {
      nonNulls[key] = value;
    }

    return [nulls, nonNulls];
  }, [{}, {}]);
};

exports.filterNullParams = filterNullParams;

var splitSelectionParameters = function splitSelectionParameters(params, primaryKeyArgName, paramKey) {
  var paramKeys = paramKey ? (0, _keys["default"])(params[paramKey]) : (0, _keys["default"])(params);

  var _paramKeys$reduce = paramKeys.reduce(function (acc, t) {
    if (t === primaryKeyArgName) {
      if (paramKey) {
        acc[0][t] = params[paramKey][t];
      } else {
        acc[0][t] = params[t];
      }
    } else {
      if (paramKey) {
        if (acc[1][paramKey] === undefined) acc[1][paramKey] = {};
        acc[1][paramKey][t] = params[paramKey][t];
      } else {
        acc[1][t] = params[t];
      }
    }

    return acc;
  }, [{}, {}]),
      _paramKeys$reduce2 = (0, _slicedToArray2["default"])(_paramKeys$reduce, 2),
      primaryKeyParam = _paramKeys$reduce2[0],
      updateParams = _paramKeys$reduce2[1];

  var first = params.first;
  var offset = params.offset;
  if (first !== undefined) updateParams['first'] = first;
  if (offset !== undefined) updateParams['offset'] = offset;
  return [primaryKeyParam, updateParams];
};

exports.splitSelectionParameters = splitSelectionParameters;

var isNeo4jType = function isNeo4jType(name) {
  return isTemporalType(name) || isSpatialType(name);
};

exports.isNeo4jType = isNeo4jType;

var isNeo4jTypeField = function isNeo4jTypeField(schemaType, fieldName) {
  return isTemporalField(schemaType, fieldName) || isSpatialField(schemaType, fieldName);
};

exports.isNeo4jTypeField = isNeo4jTypeField;

var isNeo4jTypeInput = function isNeo4jTypeInput(name) {
  return isTemporalInputType(name) || isSpatialInputType(name) || isSpatialDistanceInputType(name);
};

exports.isNeo4jTypeInput = isNeo4jTypeInput;

var isTemporalType = function isTemporalType(name) {
  return name === '_Neo4jTime' || name === '_Neo4jDate' || name === '_Neo4jDateTime' || name === '_Neo4jLocalTime' || name === '_Neo4jLocalDateTime';
};

exports.isTemporalType = isTemporalType;

var isTemporalField = function isTemporalField(schemaType, name) {
  var type = schemaType ? schemaType.name : '';
  return isTemporalType(type) && (name === 'year' || name === 'month' || name === 'day' || name === 'hour' || name === 'minute' || name === 'second' || name === 'microsecond' || name === 'millisecond' || name === 'nanosecond' || name === 'timezone' || name === 'formatted');
};

exports.isTemporalField = isTemporalField;

var isTemporalInputType = function isTemporalInputType(name) {
  return name === '_Neo4jTimeInput' || name === '_Neo4jDateInput' || name === '_Neo4jDateTimeInput' || name === '_Neo4jLocalTimeInput' || name === '_Neo4jLocalDateTimeInput';
};

exports.isTemporalInputType = isTemporalInputType;

var isSpatialType = function isSpatialType(name) {
  return name === '_Neo4jPoint';
};

exports.isSpatialType = isSpatialType;

var isSpatialField = function isSpatialField(schemaType, name) {
  var type = schemaType ? schemaType.name : '';
  return isSpatialType(type) && (name === 'x' || name === 'y' || name === 'z' || name === 'longitude' || name === 'latitude' || name === 'height' || name === 'crs' || name === 'srid' || name === 'formatted');
};

exports.isSpatialField = isSpatialField;

var isSpatialInputType = function isSpatialInputType(name) {
  return name === '_Neo4jPointInput';
};

exports.isSpatialInputType = isSpatialInputType;

var isSpatialDistanceInputType = function isSpatialDistanceInputType(name) {
  return name === "".concat(_types.Neo4jTypeName).concat(_spatial.SpatialType.POINT, "DistanceFilter");
};

exports.isSpatialDistanceInputType = isSpatialDistanceInputType;

var decideNeo4jTypeConstructor = function decideNeo4jTypeConstructor(typeName) {
  switch (typeName) {
    case '_Neo4jTimeInput':
      return 'time';

    case '_Neo4jDateInput':
      return 'date';

    case '_Neo4jDateTimeInput':
      return 'datetime';

    case '_Neo4jLocalTimeInput':
      return 'localtime';

    case '_Neo4jLocalDateTimeInput':
      return 'localdatetime';

    case '_Neo4jPointInput':
      return 'point';

    default:
      return '';
  }
};

exports.decideNeo4jTypeConstructor = decideNeo4jTypeConstructor;

var neo4jTypePredicateClauses = function neo4jTypePredicateClauses(filters, variableName, fieldArguments, parentParam) {
  return fieldArguments.reduce(function (acc, t) {
    // For every temporal argument
    var argName = t.name.value;
    var neo4jTypeParam = filters[argName];

    if (neo4jTypeParam) {
      // If a parameter value has been provided for it check whether
      // the provided param value is in an indexed object for a nested argument
      var paramIndex = neo4jTypeParam.index;
      var paramValue = neo4jTypeParam.value; // If it is, set and use its .value

      if (paramValue) neo4jTypeParam = paramValue;

      if (neo4jTypeParam['formatted']) {
        // Only the dedicated 'formatted' arg is used if it is provided
        var type = t ? _getNamedType(t.type).name.value : '';
        acc.push("".concat(variableName, ".").concat(argName, " = ").concat(decideNeo4jTypeConstructor(type), "($").concat( // use index if provided, for nested arguments
        typeof paramIndex === 'undefined' ? "".concat(parentParam ? "".concat(parentParam, ".") : '').concat(argName, ".formatted") : "".concat(parentParam ? "".concat(parentParam, ".") : '').concat(paramIndex, "_").concat(argName, ".formatted"), ")"));
      } else {
        (0, _keys["default"])(neo4jTypeParam).forEach(function (e) {
          acc.push("".concat(variableName, ".").concat(argName, ".").concat(e, " = $").concat(typeof paramIndex === 'undefined' ? "".concat(parentParam ? "".concat(parentParam, ".") : '').concat(argName) : "".concat(parentParam ? "".concat(parentParam, ".") : '').concat(paramIndex, "_").concat(argName), ".").concat(e));
        });
      }
    }

    return acc;
  }, []);
};

exports.neo4jTypePredicateClauses = neo4jTypePredicateClauses;

var getNeo4jTypeArguments = function getNeo4jTypeArguments(args) {
  return args ? args.reduce(function (acc, t) {
    if (!t) {
      return acc;
    }

    var fieldType = _getNamedType(t.type).name.value;

    if (isNeo4jTypeInput(fieldType)) acc.push(t);
    return acc;
  }, []) : [];
};

exports.getNeo4jTypeArguments = getNeo4jTypeArguments;

var removeIgnoredFields = function removeIgnoredFields(schemaType, selections) {
  if (!isGraphqlScalarType(schemaType) && selections && selections.length) {
    var schemaTypeField = '';
    selections = selections.filter(function (e) {
      if (e.kind === 'Field') {
        // so check if this field is ignored
        schemaTypeField = schemaType.getFields()[e.name.value];
        return schemaTypeField && schemaTypeField.astNode && !getFieldDirective(schemaTypeField.astNode, 'neo4j_ignore');
      } // keep element by default


      return true;
    });
  }

  return selections;
};

exports.removeIgnoredFields = removeIgnoredFields;

var _getNamedType = function _getNamedType(type) {
  if (type.kind !== 'NamedType') {
    return _getNamedType(type.type);
  }

  return type;
};

var getDerivedTypeNames = function getDerivedTypeNames(schema, interfaceName) {
  return (0, _values["default"])(schema.getTypeMap()).filter(function (t) {
    return (0, _graphql.isObjectType)(t);
  }).filter(function (t) {
    return t.getInterfaces().some(function (i) {
      return i.name === interfaceName;
    });
  }).map(function (t) {
    return t.name;
  });
};

exports.getDerivedTypeNames = getDerivedTypeNames;