"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs2/helpers/interopRequireDefault");

var _Object$defineProperty2 = require("@babel/runtime-corejs2/core-js/object/define-property");

_Object$defineProperty2(exports, "__esModule", {
  value: true
});

exports.translateMutation = exports.translateQuery = exports.neo4jType = exports.neo4jTypeField = exports.nodeTypeFieldOnRelationType = exports.relationTypeFieldOnNodeType = exports.relationFieldOnNodeType = exports.customCypherField = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/define-property"));

var _defineProperties = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/define-properties"));

var _getOwnPropertyDescriptors = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/get-own-property-descriptors"));

var _getOwnPropertyDescriptor = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/get-own-property-descriptor"));

var _getOwnPropertySymbols = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/get-own-property-symbols"));

var _isInteger = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/number/is-integer"));

var _entries = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/entries"));

var _keys = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/keys"));

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/toConsumableArray"));

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/slicedToArray"));

var _isArray = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/array/is-array"));

var _defineProperty3 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/defineProperty"));

var _utils = require("./utils");

var _graphql = require("graphql");

var _selections = require("./selections");

var _lodash = _interopRequireDefault(require("lodash"));

var _neo4jDriver = _interopRequireDefault(require("neo4j-driver"));

function ownKeys(object, enumerableOnly) { var keys = (0, _keys["default"])(object); if (_getOwnPropertySymbols["default"]) { var symbols = (0, _getOwnPropertySymbols["default"])(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return (0, _getOwnPropertyDescriptor["default"])(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty3["default"])(target, key, source[key]); }); } else if (_getOwnPropertyDescriptors["default"]) { (0, _defineProperties["default"])(target, (0, _getOwnPropertyDescriptors["default"])(source)); } else { ownKeys(Object(source)).forEach(function (key) { (0, _defineProperty2["default"])(target, key, (0, _getOwnPropertyDescriptor["default"])(source, key)); }); } } return target; }

var derivedTypesParamName = function derivedTypesParamName(interfaceName) {
  return "".concat(interfaceName, "_derivedTypes");
};

var fragmentType = function fragmentType(varName, interfaceName) {
  return "FRAGMENT_TYPE: head( [ label IN labels(".concat(varName, ") WHERE label IN $").concat(derivedTypesParamName(interfaceName), " ] )");
};

var derivedTypesParams = function derivedTypesParams(schema, interfaceName) {
  var res = {};
  res[derivedTypesParamName(interfaceName)] = (0, _utils.getDerivedTypeNames)(schema, interfaceName);
  return res;
};

var customCypherField = function customCypherField(_ref) {
  var customCypher = _ref.customCypher,
      cypherParams = _ref.cypherParams,
      paramIndex = _ref.paramIndex,
      schemaTypeRelation = _ref.schemaTypeRelation,
      initial = _ref.initial,
      fieldName = _ref.fieldName,
      fieldType = _ref.fieldType,
      nestedVariable = _ref.nestedVariable,
      variableName = _ref.variableName,
      headSelection = _ref.headSelection,
      schemaType = _ref.schemaType,
      resolveInfo = _ref.resolveInfo,
      subSelection = _ref.subSelection,
      skipLimit = _ref.skipLimit,
      commaIfTail = _ref.commaIfTail,
      tailParams = _ref.tailParams;

  if (schemaTypeRelation) {
    variableName = "".concat(variableName, "_relation");
  }

  var fieldIsList = !!fieldType.ofType;
  var fieldIsInterfaceType = fieldIsList && fieldType.ofType.astNode && fieldType.ofType.astNode.kind === 'InterfaceTypeDefinition'; // similar: [ x IN apoc.cypher.runFirstColumn("WITH {this} AS this MATCH (this)--(:Genre)--(o:Movie) RETURN o", {this: movie}, true) |x {.title}][1..2])
  // For @cypher fields with object payload types, customCypherField is
  // called after the recursive call to compute a subSelection. But recurse()
  // increments paramIndex. So here we need to decrement it in order to map
  // appropriately to the indexed keys produced in getFilterParams()

  var cypherFieldParamsIndex = paramIndex - 1;
  var fragmentTypeParams = fieldIsInterfaceType ? derivedTypesParams(resolveInfo.schema, fieldType.ofType.astNode.name.value) : {};
  return _objectSpread({
    initial: "".concat(initial).concat(fieldName, ": ").concat(fieldIsList ? '' : 'head(', "[ ").concat(nestedVariable, " IN apoc.cypher.runFirstColumn(\"").concat(customCypher, "\", {").concat((0, _utils.cypherDirectiveArgs)(variableName, headSelection, cypherParams, schemaType, resolveInfo, cypherFieldParamsIndex), "}, true) | ").concat(nestedVariable, " {").concat(fieldIsInterfaceType ? "".concat(fragmentType(nestedVariable, fieldType.ofType.astNode.name.value), ",") : '').concat(subSelection[0], "}]").concat(fieldIsList ? '' : ')').concat(skipLimit, " ").concat(commaIfTail)
  }, tailParams, {}, fragmentTypeParams);
};

exports.customCypherField = customCypherField;

var relationFieldOnNodeType = function relationFieldOnNodeType(_ref2) {
  var initial = _ref2.initial,
      fieldName = _ref2.fieldName,
      fieldType = _ref2.fieldType,
      variableName = _ref2.variableName,
      relDirection = _ref2.relDirection,
      relType = _ref2.relType,
      nestedVariable = _ref2.nestedVariable,
      isInlineFragment = _ref2.isInlineFragment,
      innerSchemaType = _ref2.innerSchemaType,
      paramIndex = _ref2.paramIndex,
      fieldArgs = _ref2.fieldArgs,
      filterParams = _ref2.filterParams,
      selectionFilters = _ref2.selectionFilters,
      neo4jTypeArgs = _ref2.neo4jTypeArgs,
      selections = _ref2.selections,
      schemaType = _ref2.schemaType,
      subSelection = _ref2.subSelection,
      skipLimit = _ref2.skipLimit,
      commaIfTail = _ref2.commaIfTail,
      tailParams = _ref2.tailParams,
      neo4jTypeClauses = _ref2.neo4jTypeClauses,
      resolveInfo = _ref2.resolveInfo,
      cypherParams = _ref2.cypherParams;
  var safeVariableName = (0, _utils.safeVar)(nestedVariable);
  var allParams = (0, _utils.innerFilterParams)(filterParams, neo4jTypeArgs);
  var queryParams = (0, _utils.paramsToString)(_lodash["default"].filter(allParams, function (param) {
    return !(0, _isArray["default"])(param.value);
  }));

  var _processFilterArgumen = processFilterArgument({
    fieldArgs: fieldArgs,
    schemaType: innerSchemaType,
    variableName: nestedVariable,
    resolveInfo: resolveInfo,
    params: selectionFilters,
    paramIndex: paramIndex
  }),
      _processFilterArgumen2 = (0, _slicedToArray2["default"])(_processFilterArgumen, 2),
      filterPredicates = _processFilterArgumen2[0],
      serializedFilterParam = _processFilterArgumen2[1];

  var filterParamKey = "".concat(tailParams.paramIndex, "_filter");
  var fieldArgumentParams = subSelection[1];
  var filterParam = fieldArgumentParams[filterParamKey];

  if (filterParam && typeof serializedFilterParam[filterParamKey] !== 'undefined') {
    subSelection[1][filterParamKey] = serializedFilterParam[filterParamKey];
  }

  var arrayFilterParams = _lodash["default"].pickBy(filterParams, function (param, keyName) {
    return (0, _isArray["default"])(param.value) && !('orderBy' === keyName);
  });

  var arrayPredicates = _lodash["default"].map(arrayFilterParams, function (value, key) {
    var param = _lodash["default"].find(allParams, function (param) {
      return param.key === key;
    });

    return "".concat(safeVariableName, ".").concat((0, _utils.safeVar)(key), " IN $").concat(param.value.index, "_").concat(key);
  });

  var whereClauses = [].concat((0, _toConsumableArray2["default"])(neo4jTypeClauses), (0, _toConsumableArray2["default"])(arrayPredicates), (0, _toConsumableArray2["default"])(filterPredicates));
  var orderByParam = filterParams['orderBy'];
  var temporalOrdering = temporalOrderingFieldExists(schemaType, filterParams);
  var fragmentTypeParams = isInlineFragment ? derivedTypesParams(resolveInfo.schema, innerSchemaType.name) : {};
  subSelection[1] = _objectSpread({}, subSelection[1], {}, fragmentTypeParams);
  return {
    selection: _objectSpread({
      initial: "".concat(initial).concat(fieldName, ": ").concat(!(0, _utils.isArrayType)(fieldType) ? 'head(' : '').concat(orderByParam ? temporalOrdering ? "[sortedElement IN apoc.coll.sortMulti(" : "apoc.coll.sortMulti(" : '', "[(").concat((0, _utils.safeVar)(variableName), ")").concat(relDirection === 'in' || relDirection === 'IN' ? '<' : '', "-[:").concat((0, _utils.safeLabel)([relType]), "]-").concat(relDirection === 'out' || relDirection === 'OUT' ? '>' : '', "(").concat(safeVariableName, ":".concat((0, _utils.safeLabel)([innerSchemaType.name].concat((0, _toConsumableArray2["default"])((0, _utils.getAdditionalLabels)(resolveInfo.schema.getType(innerSchemaType.name), cypherParams)))))).concat(queryParams, ")").concat(whereClauses.length > 0 ? " WHERE ".concat(whereClauses.join(' AND ')) : '', " | ").concat(nestedVariable, " {").concat(isInlineFragment ? "".concat(fragmentType(nestedVariable, innerSchemaType.name)).concat(subSelection[0] ? ", ".concat(subSelection[0]) : '') : subSelection[0], "}]").concat(orderByParam ? ", [".concat(buildSortMultiArgs(orderByParam), "])").concat(temporalOrdering ? " | sortedElement { .*,  ".concat(neo4jTypeOrderingClauses(selections, innerSchemaType), "}]") : "") : '').concat(!(0, _utils.isArrayType)(fieldType) ? ')' : '').concat(skipLimit, " ").concat(commaIfTail)
    }, tailParams),
    subSelection: subSelection
  };
};

exports.relationFieldOnNodeType = relationFieldOnNodeType;

var relationTypeFieldOnNodeType = function relationTypeFieldOnNodeType(_ref3) {
  var innerSchemaTypeRelation = _ref3.innerSchemaTypeRelation,
      initial = _ref3.initial,
      fieldName = _ref3.fieldName,
      subSelection = _ref3.subSelection,
      skipLimit = _ref3.skipLimit,
      commaIfTail = _ref3.commaIfTail,
      tailParams = _ref3.tailParams,
      fieldType = _ref3.fieldType,
      variableName = _ref3.variableName,
      schemaType = _ref3.schemaType,
      innerSchemaType = _ref3.innerSchemaType,
      nestedVariable = _ref3.nestedVariable,
      queryParams = _ref3.queryParams,
      filterParams = _ref3.filterParams,
      neo4jTypeArgs = _ref3.neo4jTypeArgs,
      resolveInfo = _ref3.resolveInfo,
      selectionFilters = _ref3.selectionFilters,
      paramIndex = _ref3.paramIndex,
      fieldArgs = _ref3.fieldArgs,
      cypherParams = _ref3.cypherParams;

  if (innerSchemaTypeRelation.from === innerSchemaTypeRelation.to) {
    return {
      selection: _objectSpread({
        initial: "".concat(initial).concat(fieldName, ": {").concat(subSelection[0], "}").concat(skipLimit, " ").concat(commaIfTail)
      }, tailParams),
      subSelection: subSelection
    };
  }

  var relationshipVariableName = "".concat(nestedVariable, "_relation");
  var neo4jTypeClauses = (0, _utils.neo4jTypePredicateClauses)(filterParams, relationshipVariableName, neo4jTypeArgs);

  var _processFilterArgumen3 = processFilterArgument({
    fieldArgs: fieldArgs,
    schemaType: innerSchemaType,
    variableName: relationshipVariableName,
    resolveInfo: resolveInfo,
    params: selectionFilters,
    paramIndex: paramIndex,
    rootIsRelationType: true
  }),
      _processFilterArgumen4 = (0, _slicedToArray2["default"])(_processFilterArgumen3, 2),
      filterPredicates = _processFilterArgumen4[0],
      serializedFilterParam = _processFilterArgumen4[1];

  var filterParamKey = "".concat(tailParams.paramIndex, "_filter");
  var fieldArgumentParams = subSelection[1];
  var filterParam = fieldArgumentParams[filterParamKey];

  if (filterParam && typeof serializedFilterParam[filterParamKey] !== 'undefined') {
    subSelection[1][filterParamKey] = serializedFilterParam[filterParamKey];
  }

  var whereClauses = [].concat((0, _toConsumableArray2["default"])(neo4jTypeClauses), (0, _toConsumableArray2["default"])(filterPredicates));
  return {
    selection: _objectSpread({
      initial: "".concat(initial).concat(fieldName, ": ").concat(!(0, _utils.isArrayType)(fieldType) ? 'head(' : '', "[(").concat((0, _utils.safeVar)(variableName), ")").concat(schemaType.name === innerSchemaTypeRelation.to ? '<' : '', "-[").concat((0, _utils.safeVar)(relationshipVariableName), ":").concat((0, _utils.safeLabel)(innerSchemaTypeRelation.name)).concat(queryParams, "]-").concat(schemaType.name === innerSchemaTypeRelation.from ? '>' : '', "(:").concat((0, _utils.safeLabel)(schemaType.name === innerSchemaTypeRelation.from ? [innerSchemaTypeRelation.to].concat((0, _toConsumableArray2["default"])((0, _utils.getAdditionalLabels)(resolveInfo.schema.getType(innerSchemaTypeRelation.to), cypherParams))) : [innerSchemaTypeRelation.from].concat((0, _toConsumableArray2["default"])((0, _utils.getAdditionalLabels)(resolveInfo.schema.getType(innerSchemaTypeRelation.from), cypherParams)))), ") ").concat(whereClauses.length > 0 ? "WHERE ".concat(whereClauses.join(' AND '), " ") : '', "| ").concat(relationshipVariableName, " {").concat(subSelection[0], "}]").concat(!(0, _utils.isArrayType)(fieldType) ? ')' : '').concat(skipLimit, " ").concat(commaIfTail)
    }, tailParams),
    subSelection: subSelection
  };
};

exports.relationTypeFieldOnNodeType = relationTypeFieldOnNodeType;

var nodeTypeFieldOnRelationType = function nodeTypeFieldOnRelationType(_ref4) {
  var fieldInfo = _ref4.fieldInfo,
      schemaTypeRelation = _ref4.schemaTypeRelation,
      innerSchemaType = _ref4.innerSchemaType,
      isInlineFragment = _ref4.isInlineFragment,
      paramIndex = _ref4.paramIndex,
      schemaType = _ref4.schemaType,
      filterParams = _ref4.filterParams,
      neo4jTypeArgs = _ref4.neo4jTypeArgs,
      parentSelectionInfo = _ref4.parentSelectionInfo,
      resolveInfo = _ref4.resolveInfo,
      selectionFilters = _ref4.selectionFilters,
      fieldArgs = _ref4.fieldArgs,
      cypherParams = _ref4.cypherParams;

  if ((0, _utils.isRootSelection)({
    selectionInfo: parentSelectionInfo,
    rootType: 'relationship'
  }) && (0, _utils.isRelationTypeDirectedField)(fieldInfo.fieldName)) {
    return {
      selection: relationTypeMutationPayloadField(_objectSpread({}, fieldInfo, {
        schemaType: schemaType,
        isInlineFragment: isInlineFragment,
        parentSelectionInfo: parentSelectionInfo,
        innerSchemaType: innerSchemaType,
        resolveInfo: resolveInfo
      })),
      subSelection: fieldInfo.subSelection
    };
  } // Normal case of schemaType with a relationship directive


  return directedNodeTypeFieldOnRelationType(_objectSpread({}, fieldInfo, {
    schemaTypeRelation: schemaTypeRelation,
    innerSchemaType: innerSchemaType,
    isInlineFragment: isInlineFragment,
    paramIndex: paramIndex,
    schemaType: schemaType,
    filterParams: filterParams,
    neo4jTypeArgs: neo4jTypeArgs,
    resolveInfo: resolveInfo,
    selectionFilters: selectionFilters,
    fieldArgs: fieldArgs,
    cypherParams: cypherParams
  }));
};

exports.nodeTypeFieldOnRelationType = nodeTypeFieldOnRelationType;

var relationTypeMutationPayloadField = function relationTypeMutationPayloadField(_ref5) {
  var initial = _ref5.initial,
      fieldName = _ref5.fieldName,
      variableName = _ref5.variableName,
      nestedVariable = _ref5.nestedVariable,
      subSelection = _ref5.subSelection,
      skipLimit = _ref5.skipLimit,
      commaIfTail = _ref5.commaIfTail,
      tailParams = _ref5.tailParams,
      parentSelectionInfo = _ref5.parentSelectionInfo,
      isInlineFragment = _ref5.isInlineFragment,
      resolveInfo = _ref5.resolveInfo,
      innerSchemaType = _ref5.innerSchemaType;
  var safeVariableName = (0, _utils.safeVar)(variableName);
  var fragmentTypeParams = isInlineFragment ? derivedTypesParams(resolveInfo.schema, innerSchemaType.name) : {};
  subSelection[1] = _objectSpread({}, subSelection[1], {}, fragmentTypeParams);
  return _objectSpread({
    initial: "".concat(initial).concat(fieldName, ": ").concat(safeVariableName, " {").concat(isInlineFragment ? "".concat(fragmentType(nestedVariable, innerSchemaType.name), ",") : '').concat(subSelection[0], "}").concat(skipLimit, " ").concat(commaIfTail)
  }, tailParams, {
    variableName: fieldName === 'from' ? parentSelectionInfo.to : parentSelectionInfo.from
  });
};

var directedNodeTypeFieldOnRelationType = function directedNodeTypeFieldOnRelationType(_ref6) {
  var initial = _ref6.initial,
      fieldName = _ref6.fieldName,
      fieldType = _ref6.fieldType,
      variableName = _ref6.variableName,
      queryParams = _ref6.queryParams,
      nestedVariable = _ref6.nestedVariable,
      subSelection = _ref6.subSelection,
      skipLimit = _ref6.skipLimit,
      commaIfTail = _ref6.commaIfTail,
      tailParams = _ref6.tailParams,
      schemaTypeRelation = _ref6.schemaTypeRelation,
      innerSchemaType = _ref6.innerSchemaType,
      isInlineFragment = _ref6.isInlineFragment,
      filterParams = _ref6.filterParams,
      neo4jTypeArgs = _ref6.neo4jTypeArgs,
      paramIndex = _ref6.paramIndex,
      resolveInfo = _ref6.resolveInfo,
      selectionFilters = _ref6.selectionFilters,
      fieldArgs = _ref6.fieldArgs,
      cypherParams = _ref6.cypherParams;
  var relType = schemaTypeRelation.name;
  var fromTypeName = schemaTypeRelation.from;
  var toTypeName = schemaTypeRelation.to;
  var isFromField = fieldName === fromTypeName || fieldName === 'from';
  var isToField = fieldName === toTypeName || fieldName === 'to';
  var fragmentTypeParams = isInlineFragment ? derivedTypesParams(resolveInfo.schema, innerSchemaType.name) : {};
  subSelection[1] = _objectSpread({}, subSelection[1], {}, fragmentTypeParams); // Since the translations are significantly different,
  // we first check whether the relationship is reflexive

  if (fromTypeName === toTypeName) {
    var relationshipVariableName = "".concat(variableName, "_").concat(isFromField ? 'from' : 'to', "_relation");

    if ((0, _utils.isRelationTypeDirectedField)(fieldName)) {
      var temporalFieldRelationshipVariableName = "".concat(nestedVariable, "_relation");
      var neo4jTypeClauses = (0, _utils.neo4jTypePredicateClauses)(filterParams, temporalFieldRelationshipVariableName, neo4jTypeArgs);

      var _processFilterArgumen5 = processFilterArgument({
        fieldArgs: fieldArgs,
        schemaType: innerSchemaType,
        variableName: relationshipVariableName,
        resolveInfo: resolveInfo,
        params: selectionFilters,
        paramIndex: paramIndex,
        rootIsRelationType: true
      }),
          _processFilterArgumen6 = (0, _slicedToArray2["default"])(_processFilterArgumen5, 2),
          filterPredicates = _processFilterArgumen6[0],
          serializedFilterParam = _processFilterArgumen6[1];

      var filterParamKey = "".concat(tailParams.paramIndex, "_filter");
      var fieldArgumentParams = subSelection[1];
      var filterParam = fieldArgumentParams[filterParamKey];

      if (filterParam && typeof serializedFilterParam[filterParamKey] !== 'undefined') {
        subSelection[1][filterParamKey] = serializedFilterParam[filterParamKey];
      }

      var whereClauses = [].concat((0, _toConsumableArray2["default"])(neo4jTypeClauses), (0, _toConsumableArray2["default"])(filterPredicates));
      return {
        selection: _objectSpread({
          initial: "".concat(initial).concat(fieldName, ": ").concat(!(0, _utils.isArrayType)(fieldType) ? 'head(' : '', "[(").concat((0, _utils.safeVar)(variableName), ")").concat(isFromField ? '<' : '', "-[").concat((0, _utils.safeVar)(relationshipVariableName), ":").concat((0, _utils.safeLabel)(relType)).concat(queryParams, "]-").concat(isToField ? '>' : '', "(").concat((0, _utils.safeVar)(nestedVariable)).concat(!isInlineFragment ? ":".concat((0, _utils.safeLabel)([fromTypeName].concat((0, _toConsumableArray2["default"])((0, _utils.getAdditionalLabels)(resolveInfo.schema.getType(fromTypeName), cypherParams))))) : '', ") ").concat(whereClauses.length > 0 ? "WHERE ".concat(whereClauses.join(' AND '), " ") : '', "| ").concat(relationshipVariableName, " {").concat(isInlineFragment ? "".concat(fragmentType(nestedVariable, innerSchemaType.name)).concat(subSelection[0] ? ", ".concat(subSelection[0]) : '') : subSelection[0], "}]").concat(!(0, _utils.isArrayType)(fieldType) ? ')' : '').concat(skipLimit, " ").concat(commaIfTail)
        }, tailParams),
        subSelection: subSelection
      };
    } else {
      // Case of a renamed directed field
      // e.g., 'from: Movie' -> 'Movie: Movie'
      return {
        selection: _objectSpread({
          initial: "".concat(initial).concat(fieldName, ": ").concat(variableName, " {").concat(subSelection[0], "}").concat(skipLimit, " ").concat(commaIfTail)
        }, tailParams),
        subSelection: subSelection
      };
    }
  } else {
    variableName = variableName + '_relation';
    return {
      selection: _objectSpread({
        initial: "".concat(initial).concat(fieldName, ": ").concat(!(0, _utils.isArrayType)(fieldType) ? 'head(' : '', "[(:").concat((0, _utils.safeLabel)(isFromField ? [toTypeName].concat((0, _toConsumableArray2["default"])((0, _utils.getAdditionalLabels)(resolveInfo.schema.getType(toTypeName), cypherParams))) : [fromTypeName].concat((0, _toConsumableArray2["default"])((0, _utils.getAdditionalLabels)(resolveInfo.schema.getType(fromTypeName), cypherParams)))), ")").concat(isFromField ? '<' : '', "-[").concat((0, _utils.safeVar)(variableName), "]-").concat(isToField ? '>' : '', "(").concat((0, _utils.safeVar)(nestedVariable), ":").concat(!isInlineFragment ? (0, _utils.safeLabel)([innerSchemaType.name].concat((0, _toConsumableArray2["default"])((0, _utils.getAdditionalLabels)(resolveInfo.schema.getType(innerSchemaType.name), cypherParams)))) : '').concat(queryParams, ") | ").concat(nestedVariable, " {").concat(isInlineFragment ? "".concat(fragmentType(nestedVariable, innerSchemaType.name)).concat(subSelection[0] ? ", ".concat(subSelection[0]) : '') : subSelection[0], "}]").concat(!(0, _utils.isArrayType)(fieldType) ? ')' : '').concat(skipLimit, " ").concat(commaIfTail)
      }, tailParams),
      subSelection: subSelection
    };
  }
};

var neo4jTypeField = function neo4jTypeField(_ref7) {
  var initial = _ref7.initial,
      fieldName = _ref7.fieldName,
      commaIfTail = _ref7.commaIfTail,
      tailParams = _ref7.tailParams,
      parentSelectionInfo = _ref7.parentSelectionInfo,
      secondParentSelectionInfo = _ref7.secondParentSelectionInfo;
  var parentFieldName = parentSelectionInfo.fieldName;
  var parentFieldType = parentSelectionInfo.fieldType;
  var parentSchemaType = parentSelectionInfo.schemaType;
  var parentVariableName = parentSelectionInfo.variableName;
  var secondParentVariableName = secondParentSelectionInfo.variableName; // Initially assume that the parent type of the temporal type
  // containing this temporal field was a node

  var variableName = parentVariableName;
  var fieldIsArray = (0, _utils.isArrayType)(parentFieldType);

  if (parentSchemaType && !(0, _utils.isNodeType)(parentSchemaType.astNode)) {
    // initial assumption wrong, build appropriate relationship variable
    if ((0, _utils.isRootSelection)({
      selectionInfo: secondParentSelectionInfo,
      rootType: 'relationship'
    })) {
      // If the second parent selection scope above is the root
      // then we need to use the root variableName
      variableName = "".concat(secondParentVariableName, "_relation");
    } else if ((0, _utils.isRelationTypePayload)(parentSchemaType)) {
      var parentSchemaTypeRelation = (0, _utils.getRelationTypeDirective)(parentSchemaType.astNode);

      if (parentSchemaTypeRelation.from === parentSchemaTypeRelation.to) {
        variableName = "".concat(variableName, "_relation");
      } else {
        variableName = "".concat(variableName, "_relation");
      }
    }
  }

  return _objectSpread({
    initial: "".concat(initial, " ").concat(fieldName, ": ").concat(fieldIsArray ? "".concat(fieldName === 'formatted' ? "toString(INSTANCE)" : "INSTANCE.".concat(fieldName), " ").concat(commaIfTail) : "".concat(fieldName === 'formatted' ? "toString(".concat((0, _utils.safeVar)(variableName), ".").concat(parentFieldName, ") ").concat(commaIfTail) : "".concat((0, _utils.safeVar)(variableName), ".").concat(parentFieldName, ".").concat(fieldName, " ").concat(commaIfTail)))
  }, tailParams);
};

exports.neo4jTypeField = neo4jTypeField;

var neo4jType = function neo4jType(_ref8) {
  var initial = _ref8.initial,
      fieldName = _ref8.fieldName,
      subSelection = _ref8.subSelection,
      commaIfTail = _ref8.commaIfTail,
      tailParams = _ref8.tailParams,
      variableName = _ref8.variableName,
      nestedVariable = _ref8.nestedVariable,
      fieldType = _ref8.fieldType,
      schemaType = _ref8.schemaType,
      schemaTypeRelation = _ref8.schemaTypeRelation,
      parentSelectionInfo = _ref8.parentSelectionInfo;
  var parentVariableName = parentSelectionInfo.variableName;
  var parentFilterParams = parentSelectionInfo.filterParams;
  var parentSchemaType = parentSelectionInfo.schemaType;
  var safeVariableName = (0, _utils.safeVar)(variableName);
  var relationshipVariableSuffix = "relation";
  var fieldIsArray = (0, _utils.isArrayType)(fieldType);

  if (!(0, _utils.isNodeType)(schemaType.astNode)) {
    if ((0, _utils.isRelationTypePayload)(schemaType) && schemaTypeRelation.from === schemaTypeRelation.to) {
      variableName = "".concat(nestedVariable, "_").concat(relationshipVariableSuffix);
    } else {
      if (fieldIsArray) {
        if ((0, _utils.isRootSelection)({
          selectionInfo: parentSelectionInfo,
          rootType: 'relationship'
        })) {
          variableName = "".concat(parentVariableName, "_").concat(relationshipVariableSuffix);
        } else {
          variableName = "".concat(variableName, "_").concat(relationshipVariableSuffix);
        }
      } else {
        variableName = "".concat(nestedVariable, "_").concat(relationshipVariableSuffix);
      }
    }
  }

  return _objectSpread({
    initial: "".concat(initial).concat(fieldName, ": ").concat(fieldIsArray ? "reduce(a = [], INSTANCE IN ".concat(variableName, ".").concat(fieldName, " | a + {").concat(subSelection[0], "})").concat(commaIfTail) : temporalOrderingFieldExists(parentSchemaType, parentFilterParams) ? "".concat(safeVariableName, ".").concat(fieldName).concat(commaIfTail) : "{".concat(subSelection[0], "}").concat(commaIfTail))
  }, tailParams);
}; // Query API root operation branch


exports.neo4jType = neo4jType;

var translateQuery = function translateQuery(_ref9) {
  var resolveInfo = _ref9.resolveInfo,
      context = _ref9.context,
      selections = _ref9.selections,
      variableName = _ref9.variableName,
      typeName = _ref9.typeName,
      schemaType = _ref9.schemaType,
      first = _ref9.first,
      offset = _ref9.offset,
      _id = _ref9._id,
      orderBy = _ref9.orderBy,
      otherParams = _ref9.otherParams;

  var _filterNullParams = (0, _utils.filterNullParams)({
    offset: offset,
    first: first,
    otherParams: otherParams
  }),
      _filterNullParams2 = (0, _slicedToArray2["default"])(_filterNullParams, 2),
      nullParams = _filterNullParams2[0],
      nonNullParams = _filterNullParams2[1];

  var filterParams = (0, _utils.getFilterParams)(nonNullParams);
  var queryArgs = (0, _utils.getQueryArguments)(resolveInfo);
  var neo4jTypeArgs = (0, _utils.getNeo4jTypeArguments)(queryArgs);
  var queryTypeCypherDirective = (0, _utils.getQueryCypherDirective)(resolveInfo);
  var cypherParams = getCypherParams(context);
  var queryParams = (0, _utils.paramsToString)((0, _utils.innerFilterParams)(filterParams, neo4jTypeArgs, null, queryTypeCypherDirective ? true : false), cypherParams);
  var safeVariableName = (0, _utils.safeVar)(variableName);
  var neo4jTypeClauses = (0, _utils.neo4jTypePredicateClauses)(filterParams, safeVariableName, neo4jTypeArgs);
  var outerSkipLimit = (0, _utils.getOuterSkipLimit)(first, offset);
  var orderByValue = (0, _utils.computeOrderBy)(resolveInfo, schemaType);

  if (queryTypeCypherDirective) {
    return customQuery({
      resolveInfo: resolveInfo,
      cypherParams: cypherParams,
      schemaType: schemaType,
      argString: queryParams,
      selections: selections,
      variableName: variableName,
      typeName: typeName,
      orderByValue: orderByValue,
      outerSkipLimit: outerSkipLimit,
      queryTypeCypherDirective: queryTypeCypherDirective,
      nonNullParams: nonNullParams
    });
  } else {
    var additionalLabels = (0, _utils.getAdditionalLabels)(schemaType, cypherParams);
    return nodeQuery({
      resolveInfo: resolveInfo,
      cypherParams: cypherParams,
      schemaType: schemaType,
      argString: queryParams,
      selections: selections,
      variableName: variableName,
      typeName: typeName,
      additionalLabels: additionalLabels,
      neo4jTypeClauses: neo4jTypeClauses,
      orderByValue: orderByValue,
      outerSkipLimit: outerSkipLimit,
      nullParams: nullParams,
      nonNullParams: nonNullParams,
      filterParams: filterParams,
      neo4jTypeArgs: neo4jTypeArgs,
      _id: _id
    });
  }
};

exports.translateQuery = translateQuery;

var getCypherParams = function getCypherParams(context) {
  return context && context.cypherParams && context.cypherParams instanceof Object && (0, _keys["default"])(context.cypherParams).length > 0 ? context.cypherParams : undefined;
}; // Custom read operation


var customQuery = function customQuery(_ref10) {
  var resolveInfo = _ref10.resolveInfo,
      cypherParams = _ref10.cypherParams,
      schemaType = _ref10.schemaType,
      argString = _ref10.argString,
      selections = _ref10.selections,
      variableName = _ref10.variableName,
      typeName = _ref10.typeName,
      orderByValue = _ref10.orderByValue,
      outerSkipLimit = _ref10.outerSkipLimit,
      queryTypeCypherDirective = _ref10.queryTypeCypherDirective,
      nonNullParams = _ref10.nonNullParams;
  var safeVariableName = (0, _utils.safeVar)(variableName);

  var _buildCypherSelection = (0, _selections.buildCypherSelection)({
    cypherParams: cypherParams,
    selections: selections,
    variableName: variableName,
    schemaType: schemaType,
    resolveInfo: resolveInfo
  }),
      _buildCypherSelection2 = (0, _slicedToArray2["default"])(_buildCypherSelection, 2),
      subQuery = _buildCypherSelection2[0],
      subParams = _buildCypherSelection2[1];

  var params = _objectSpread({}, nonNullParams, {}, subParams);

  if (cypherParams) {
    params['cypherParams'] = cypherParams;
  } // QueryType with a @cypher directive


  var cypherQueryArg = queryTypeCypherDirective.arguments.find(function (x) {
    return x.name.value === 'statement';
  });
  var isScalarType = (0, _utils.isGraphqlScalarType)(schemaType);
  var isInterfaceType = (0, _utils.isGraphqlInterfaceType)(schemaType);
  var isNeo4jTypeOutput = (0, _utils.isNeo4jType)(schemaType.name);
  var orderByClause = orderByValue.cypherPart;
  var query = "WITH apoc.cypher.runFirstColumn(\"".concat(cypherQueryArg.value.value, "\", ").concat(argString || 'null', ", True) AS x UNWIND x AS ").concat(safeVariableName, " RETURN ").concat(safeVariableName, " ").concat( // Don't add subQuery for scalar type payloads
  // FIXME: fix subselection translation for temporal type payload
  !isNeo4jTypeOutput && !isScalarType ? "{".concat(isInterfaceType ? "".concat(fragmentType(safeVariableName, schemaType.name), ",") : '').concat(subQuery, "} AS ").concat(safeVariableName).concat(orderByClause) : '').concat(outerSkipLimit);
  var fragmentTypeParams = isInterfaceType ? derivedTypesParams(resolveInfo.schema, schemaType.name) : {};
  return [query, _objectSpread({}, params, {}, fragmentTypeParams)];
}; // Generated API


var nodeQuery = function nodeQuery(_ref11) {
  var resolveInfo = _ref11.resolveInfo,
      cypherParams = _ref11.cypherParams,
      schemaType = _ref11.schemaType,
      selections = _ref11.selections,
      variableName = _ref11.variableName,
      typeName = _ref11.typeName,
      _ref11$additionalLabe = _ref11.additionalLabels,
      additionalLabels = _ref11$additionalLabe === void 0 ? [] : _ref11$additionalLabe,
      neo4jTypeClauses = _ref11.neo4jTypeClauses,
      orderByValue = _ref11.orderByValue,
      outerSkipLimit = _ref11.outerSkipLimit,
      nullParams = _ref11.nullParams,
      nonNullParams = _ref11.nonNullParams,
      filterParams = _ref11.filterParams,
      neo4jTypeArgs = _ref11.neo4jTypeArgs,
      _id = _ref11._id;
  var safeVariableName = (0, _utils.safeVar)(variableName);
  var safeLabelName = (0, _utils.safeLabel)([typeName].concat((0, _toConsumableArray2["default"])(additionalLabels)));
  var rootParamIndex = 1;

  var _buildCypherSelection3 = (0, _selections.buildCypherSelection)({
    cypherParams: cypherParams,
    selections: selections,
    variableName: variableName,
    schemaType: schemaType,
    resolveInfo: resolveInfo,
    paramIndex: rootParamIndex
  }),
      _buildCypherSelection4 = (0, _slicedToArray2["default"])(_buildCypherSelection3, 2),
      subQuery = _buildCypherSelection4[0],
      subParams = _buildCypherSelection4[1];

  var fieldArgs = (0, _utils.getQueryArguments)(resolveInfo);

  var _processFilterArgumen7 = processFilterArgument({
    fieldArgs: fieldArgs,
    schemaType: schemaType,
    variableName: variableName,
    resolveInfo: resolveInfo,
    params: nonNullParams,
    paramIndex: rootParamIndex
  }),
      _processFilterArgumen8 = (0, _slicedToArray2["default"])(_processFilterArgumen7, 2),
      filterPredicates = _processFilterArgumen8[0],
      serializedFilter = _processFilterArgumen8[1];

  var params = _objectSpread({}, serializedFilter, {}, subParams);

  if (cypherParams) {
    params['cypherParams'] = cypherParams;
  }

  var arrayParams = _lodash["default"].pickBy(filterParams, _isArray["default"]);

  var args = (0, _utils.innerFilterParams)(filterParams, neo4jTypeArgs);
  var argString = (0, _utils.paramsToString)(_lodash["default"].filter(args, function (arg) {
    return !(0, _isArray["default"])(arg.value);
  }));
  var idWherePredicate = typeof _id !== 'undefined' ? "ID(".concat(safeVariableName, ")=").concat(_id) : '';
  var nullFieldPredicates = (0, _keys["default"])(nullParams).map(function (key) {
    return "".concat(variableName, ".").concat(key, " IS NULL");
  });

  var arrayPredicates = _lodash["default"].map(arrayParams, function (value, key) {
    return "".concat(safeVariableName, ".").concat((0, _utils.safeVar)(key), " IN $").concat(key);
  });

  var predicateClauses = [idWherePredicate].concat((0, _toConsumableArray2["default"])(filterPredicates), (0, _toConsumableArray2["default"])(nullFieldPredicates), (0, _toConsumableArray2["default"])(neo4jTypeClauses), (0, _toConsumableArray2["default"])(arrayPredicates)).filter(function (predicate) {
    return !!predicate;
  }).join(' AND ');
  var predicate = predicateClauses ? "WHERE ".concat(predicateClauses, " ") : '';
  var optimization = orderByValue.optimization,
      orderByClause = orderByValue.cypherPart;
  var fragmentTypeValue = (0, _utils.isGraphqlInterfaceType)(schemaType) ? "".concat(fragmentType(safeVariableName, schemaType.name), ",") : '';
  var fragmentTypeParams = (0, _utils.isGraphqlInterfaceType)(schemaType) ? derivedTypesParams(resolveInfo.schema, schemaType.name) : {};
  var query = "MATCH (".concat(safeVariableName, ":").concat(safeLabelName).concat(argString ? " ".concat(argString) : '', ") ").concat(predicate).concat(optimization.earlyOrderBy ? "WITH ".concat(safeVariableName).concat(orderByClause) : '', "RETURN ").concat(safeVariableName, " {").concat(fragmentTypeValue).concat(subQuery, "} AS ").concat(safeVariableName).concat(optimization.earlyOrderBy ? '' : orderByClause).concat(outerSkipLimit);
  return [query, _objectSpread({}, params, {}, fragmentTypeParams)];
}; // Mutation API root operation branch


var translateMutation = function translateMutation(_ref12) {
  var resolveInfo = _ref12.resolveInfo,
      context = _ref12.context,
      schemaType = _ref12.schemaType,
      selections = _ref12.selections,
      variableName = _ref12.variableName,
      typeName = _ref12.typeName,
      first = _ref12.first,
      offset = _ref12.offset,
      otherParams = _ref12.otherParams;
  var outerSkipLimit = (0, _utils.getOuterSkipLimit)(first, offset);
  var orderByValue = (0, _utils.computeOrderBy)(resolveInfo, schemaType);
  var additionalNodeLabels = (0, _utils.getAdditionalLabels)(schemaType, getCypherParams(context));
  var interfaceLabels = typeof schemaType.getInterfaces === 'function' ? schemaType.getInterfaces().map(function (i) {
    return i.name;
  }) : [];
  var mutationTypeCypherDirective = (0, _utils.getMutationCypherDirective)(resolveInfo);
  var mutationMeta = resolveInfo.schema.getMutationType().getFields()[resolveInfo.fieldName].astNode.directives.find(function (x) {
    return x.name.value === 'MutationMeta';
  });
  var params = (0, _utils.initializeMutationParams)({
    mutationMeta: mutationMeta,
    resolveInfo: resolveInfo,
    mutationTypeCypherDirective: mutationTypeCypherDirective,
    first: first,
    otherParams: otherParams,
    offset: offset
  });

  if (mutationTypeCypherDirective) {
    return customMutation({
      resolveInfo: resolveInfo,
      schemaType: schemaType,
      selections: selections,
      params: params,
      context: context,
      mutationTypeCypherDirective: mutationTypeCypherDirective,
      variableName: variableName,
      orderByValue: orderByValue,
      outerSkipLimit: outerSkipLimit
    });
  } else if ((0, _utils.isCreateMutation)(resolveInfo)) {
    return nodeCreate({
      resolveInfo: resolveInfo,
      schemaType: schemaType,
      selections: selections,
      params: params,
      variableName: variableName,
      typeName: typeName,
      additionalLabels: additionalNodeLabels.concat(interfaceLabels)
    });
  } else if ((0, _utils.isDeleteMutation)(resolveInfo)) {
    return nodeDelete({
      resolveInfo: resolveInfo,
      schemaType: schemaType,
      selections: selections,
      params: params,
      variableName: variableName,
      typeName: typeName,
      additionalLabels: additionalNodeLabels
    });
  } else if ((0, _utils.isAddMutation)(resolveInfo)) {
    return relationshipCreate({
      resolveInfo: resolveInfo,
      schemaType: schemaType,
      selections: selections,
      params: params,
      context: context
    });
  } else if ((0, _utils.isUpdateMutation)(resolveInfo) || (0, _utils.isMergeMutation)(resolveInfo)) {
    /**
     * TODO: Once we are no longer using the @MutationMeta directive
     * on relationship mutations, we will need to more directly identify
     * whether this Merge mutation if for a node or relationship
     */
    if (mutationMeta) {
      return relationshipMergeOrUpdate({
        mutationMeta: mutationMeta,
        resolveInfo: resolveInfo,
        selections: selections,
        schemaType: schemaType,
        params: params,
        context: context
      });
    } else {
      return nodeMergeOrUpdate({
        resolveInfo: resolveInfo,
        variableName: variableName,
        typeName: typeName,
        selections: selections,
        schemaType: schemaType,
        params: params,
        additionalLabels: additionalNodeLabels.concat(interfaceLabels)
      });
    }
  } else if ((0, _utils.isRemoveMutation)(resolveInfo)) {
    return relationshipDelete({
      resolveInfo: resolveInfo,
      schemaType: schemaType,
      selections: selections,
      params: params,
      context: context
    });
  } else {
    // throw error - don't know how to handle this type of mutation
    throw new Error('Do not know how to handle this type of mutation. Mutation does not follow naming convention.');
  }
}; // Custom write operation


exports.translateMutation = translateMutation;

var customMutation = function customMutation(_ref13) {
  var params = _ref13.params,
      context = _ref13.context,
      mutationTypeCypherDirective = _ref13.mutationTypeCypherDirective,
      selections = _ref13.selections,
      variableName = _ref13.variableName,
      schemaType = _ref13.schemaType,
      resolveInfo = _ref13.resolveInfo,
      orderByValue = _ref13.orderByValue,
      outerSkipLimit = _ref13.outerSkipLimit;
  var cypherParams = getCypherParams(context);
  var safeVariableName = (0, _utils.safeVar)(variableName); // FIXME: support IN for multiple values -> WHERE

  var argString = (0, _utils.paramsToString)((0, _utils.innerFilterParams)((0, _utils.getFilterParams)(params.params || params), null, null, true), cypherParams);
  var cypherQueryArg = mutationTypeCypherDirective.arguments.find(function (x) {
    return x.name.value === 'statement';
  });

  var _buildCypherSelection5 = (0, _selections.buildCypherSelection)({
    selections: selections,
    variableName: variableName,
    schemaType: schemaType,
    resolveInfo: resolveInfo,
    cypherParams: cypherParams
  }),
      _buildCypherSelection6 = (0, _slicedToArray2["default"])(_buildCypherSelection5, 2),
      subQuery = _buildCypherSelection6[0],
      subParams = _buildCypherSelection6[1];

  var isScalarType = (0, _utils.isGraphqlScalarType)(schemaType);
  var isInterfaceType = (0, _utils.isGraphqlInterfaceType)(schemaType);
  var isNeo4jTypeOutput = (0, _utils.isNeo4jType)(schemaType.name);
  params = _objectSpread({}, params, {}, subParams);

  if (cypherParams) {
    params['cypherParams'] = cypherParams;
  }

  var orderByClause = orderByValue.cypherPart;
  var query = "CALL apoc.cypher.doIt(\"".concat(cypherQueryArg.value.value, "\", ").concat(argString, ") YIELD value\n    WITH apoc.map.values(value, [keys(value)[0]])[0] AS ").concat(safeVariableName, "\n    RETURN ").concat(safeVariableName, " ").concat(!isNeo4jTypeOutput && !isScalarType ? "{".concat(isInterfaceType ? "".concat(fragmentType(safeVariableName, schemaType.name), ",") : '').concat(subQuery, "} AS ").concat(safeVariableName).concat(orderByClause).concat(outerSkipLimit) : '');
  var fragmentTypeParams = isInterfaceType ? derivedTypesParams(resolveInfo.schema, schemaType.name) : {};
  return [query, _objectSpread({}, params, {}, fragmentTypeParams)];
}; // Generated API
// Node Create - Update - Delete


var nodeCreate = function nodeCreate(_ref14) {
  var variableName = _ref14.variableName,
      typeName = _ref14.typeName,
      selections = _ref14.selections,
      schemaType = _ref14.schemaType,
      resolveInfo = _ref14.resolveInfo,
      additionalLabels = _ref14.additionalLabels,
      params = _ref14.params;
  var safeVariableName = (0, _utils.safeVar)(variableName);
  var safeLabelName = (0, _utils.safeLabel)([typeName].concat((0, _toConsumableArray2["default"])(additionalLabels)));
  var statements = [];
  var args = (0, _utils.getMutationArguments)(resolveInfo);
  statements = (0, _utils.possiblySetFirstId)({
    args: args,
    statements: statements,
    params: params.params
  });

  var _buildCypherParameter = (0, _utils.buildCypherParameters)({
    args: args,
    statements: statements,
    params: params,
    paramKey: 'params',
    resolveInfo: resolveInfo
  }),
      _buildCypherParameter2 = (0, _slicedToArray2["default"])(_buildCypherParameter, 2),
      preparedParams = _buildCypherParameter2[0],
      paramStatements = _buildCypherParameter2[1];

  var _buildCypherSelection7 = (0, _selections.buildCypherSelection)({
    selections: selections,
    variableName: variableName,
    schemaType: schemaType,
    resolveInfo: resolveInfo
  }),
      _buildCypherSelection8 = (0, _slicedToArray2["default"])(_buildCypherSelection7, 2),
      subQuery = _buildCypherSelection8[0],
      subParams = _buildCypherSelection8[1];

  params = _objectSpread({}, preparedParams, {}, subParams);
  var query = "\n    CREATE (".concat(safeVariableName, ":").concat(safeLabelName, " {").concat(paramStatements.join(','), "})\n    RETURN ").concat(safeVariableName, " {").concat(subQuery, "} AS ").concat(safeVariableName, "\n  ");
  return [query, params];
};

var nodeDelete = function nodeDelete(_ref15) {
  var resolveInfo = _ref15.resolveInfo,
      selections = _ref15.selections,
      variableName = _ref15.variableName,
      typeName = _ref15.typeName,
      schemaType = _ref15.schemaType,
      additionalLabels = _ref15.additionalLabels,
      params = _ref15.params;
  var safeVariableName = (0, _utils.safeVar)(variableName);
  var safeLabelName = (0, _utils.safeLabel)([typeName].concat((0, _toConsumableArray2["default"])(additionalLabels)));
  var args = (0, _utils.getMutationArguments)(resolveInfo);
  var primaryKeyArg = args[0];
  var primaryKeyArgName = primaryKeyArg.name.value;
  var neo4jTypeArgs = (0, _utils.getNeo4jTypeArguments)(args);

  var _splitSelectionParame = (0, _utils.splitSelectionParameters)(params, primaryKeyArgName),
      _splitSelectionParame2 = (0, _slicedToArray2["default"])(_splitSelectionParame, 1),
      primaryKeyParam = _splitSelectionParame2[0];

  var neo4jTypeClauses = (0, _utils.neo4jTypePredicateClauses)(primaryKeyParam, safeVariableName, neo4jTypeArgs);

  var _buildCypherParameter3 = (0, _utils.buildCypherParameters)({
    args: args,
    params: params,
    resolveInfo: resolveInfo
  }),
      _buildCypherParameter4 = (0, _slicedToArray2["default"])(_buildCypherParameter3, 1),
      preparedParams = _buildCypherParameter4[0];

  var query = "MATCH (".concat(safeVariableName, ":").concat(safeLabelName).concat(neo4jTypeClauses.length > 0 ? ") WHERE ".concat(neo4jTypeClauses.join(' AND ')) : " {".concat(primaryKeyArgName, ": $").concat(primaryKeyArgName, "})"));

  var _buildCypherSelection9 = (0, _selections.buildCypherSelection)({
    selections: selections,
    variableName: variableName,
    schemaType: schemaType,
    resolveInfo: resolveInfo
  }),
      _buildCypherSelection10 = (0, _slicedToArray2["default"])(_buildCypherSelection9, 2),
      subQuery = _buildCypherSelection10[0],
      subParams = _buildCypherSelection10[1];

  params = _objectSpread({}, preparedParams, {}, subParams);
  var deletionVariableName = (0, _utils.safeVar)("".concat(variableName, "_toDelete")); // Cannot execute a map projection on a deleted node in Neo4j
  // so the projection is executed and aliased before the delete

  query += "\nWITH ".concat(safeVariableName, " AS ").concat(deletionVariableName, ", ").concat(safeVariableName, " {").concat(subQuery, "} AS ").concat(safeVariableName, "\nDETACH DELETE ").concat(deletionVariableName, "\nRETURN ").concat(safeVariableName);
  return [query, params];
}; // Relation Add / Remove


var relationshipCreate = function relationshipCreate(_ref16) {
  var resolveInfo = _ref16.resolveInfo,
      selections = _ref16.selections,
      schemaType = _ref16.schemaType,
      params = _ref16.params,
      context = _ref16.context;
  var mutationMeta, relationshipNameArg, fromTypeArg, toTypeArg;

  try {
    mutationMeta = resolveInfo.schema.getMutationType().getFields()[resolveInfo.fieldName].astNode.directives.find(function (x) {
      return x.name.value === 'MutationMeta';
    });
  } catch (e) {
    throw new Error('Missing required MutationMeta directive on add relationship directive');
  }

  try {
    relationshipNameArg = mutationMeta.arguments.find(function (x) {
      return x.name.value === 'relationship';
    });
    fromTypeArg = mutationMeta.arguments.find(function (x) {
      return x.name.value === 'from';
    });
    toTypeArg = mutationMeta.arguments.find(function (x) {
      return x.name.value === 'to';
    });
  } catch (e) {
    throw new Error('Missing required argument in MutationMeta directive (relationship, from, or to)');
  } //TODO: need to handle one-to-one and one-to-many


  var args = (0, _utils.getMutationArguments)(resolveInfo);
  var typeMap = resolveInfo.schema.getTypeMap();
  var cypherParams = getCypherParams(context);
  var fromType = fromTypeArg.value.value;
  var fromVar = "".concat((0, _utils.lowFirstLetter)(fromType), "_from");
  var fromInputArg = args.find(function (e) {
    return e.name.value === 'from';
  }).type;
  var fromInputAst = typeMap[(0, _graphql.getNamedType)(fromInputArg).type.name.value].astNode;
  var fromFields = fromInputAst.fields;
  var fromParam = fromFields[0].name.value;
  var fromNodeNeo4jTypeArgs = (0, _utils.getNeo4jTypeArguments)(fromFields);
  var toType = toTypeArg.value.value;
  var toVar = "".concat((0, _utils.lowFirstLetter)(toType), "_to");
  var toInputArg = args.find(function (e) {
    return e.name.value === 'to';
  }).type;
  var toInputAst = typeMap[(0, _graphql.getNamedType)(toInputArg).type.name.value].astNode;
  var toFields = toInputAst.fields;
  var toParam = toFields[0].name.value;
  var toNodeNeo4jTypeArgs = (0, _utils.getNeo4jTypeArguments)(toFields);
  var relationshipName = relationshipNameArg.value.value;
  var lowercased = relationshipName.toLowerCase();
  var dataInputArg = args.find(function (e) {
    return e.name.value === 'data';
  });
  var dataInputAst = dataInputArg ? typeMap[(0, _graphql.getNamedType)(dataInputArg.type).type.name.value].astNode : undefined;
  var dataFields = dataInputAst ? dataInputAst.fields : [];

  var _buildCypherParameter5 = (0, _utils.buildCypherParameters)({
    args: dataFields,
    params: params,
    paramKey: 'data',
    resolveInfo: resolveInfo
  }),
      _buildCypherParameter6 = (0, _slicedToArray2["default"])(_buildCypherParameter5, 2),
      preparedParams = _buildCypherParameter6[0],
      paramStatements = _buildCypherParameter6[1];

  var schemaTypeName = (0, _utils.safeVar)(schemaType);
  var fromVariable = (0, _utils.safeVar)(fromVar);
  var fromAdditionalLabels = (0, _utils.getAdditionalLabels)(resolveInfo.schema.getType(fromType), cypherParams);
  var fromLabel = (0, _utils.safeLabel)([fromType].concat((0, _toConsumableArray2["default"])(fromAdditionalLabels)));
  var toVariable = (0, _utils.safeVar)(toVar);
  var toAdditionalLabels = (0, _utils.getAdditionalLabels)(resolveInfo.schema.getType(toType), cypherParams);
  var toLabel = (0, _utils.safeLabel)([toType].concat((0, _toConsumableArray2["default"])(toAdditionalLabels)));
  var relationshipVariable = (0, _utils.safeVar)(lowercased + '_relation');
  var relationshipLabel = (0, _utils.safeLabel)(relationshipName);
  var fromNodeNeo4jTypeClauses = (0, _utils.neo4jTypePredicateClauses)(preparedParams.from, fromVariable, fromNodeNeo4jTypeArgs, 'from');
  var toNodeNeo4jTypeClauses = (0, _utils.neo4jTypePredicateClauses)(preparedParams.to, toVariable, toNodeNeo4jTypeArgs, 'to');

  var _buildCypherSelection11 = (0, _selections.buildCypherSelection)({
    selections: selections,
    schemaType: schemaType,
    resolveInfo: resolveInfo,
    parentSelectionInfo: {
      rootType: 'relationship',
      from: fromVar,
      to: toVar,
      variableName: lowercased
    },
    variableName: schemaType.name === fromType ? "".concat(toVar) : "".concat(fromVar),
    cypherParams: getCypherParams(context)
  }),
      _buildCypherSelection12 = (0, _slicedToArray2["default"])(_buildCypherSelection11, 2),
      subQuery = _buildCypherSelection12[0],
      subParams = _buildCypherSelection12[1];

  params = _objectSpread({}, preparedParams, {}, subParams);
  var query = "\n      MATCH (".concat(fromVariable, ":").concat(fromLabel).concat(fromNodeNeo4jTypeClauses && fromNodeNeo4jTypeClauses.length > 0 ? // uses either a WHERE clause for managed type primary keys (temporal, etc.)
  ") WHERE ".concat(fromNodeNeo4jTypeClauses.join(' AND '), " ") : // or a an internal matching clause for normal, scalar property primary keys
  // NOTE this will need to change if we at some point allow for multi field node selection
  " {".concat(fromParam, ": $from.").concat(fromParam, "})"), "\n      MATCH (").concat(toVariable, ":").concat(toLabel).concat(toNodeNeo4jTypeClauses && toNodeNeo4jTypeClauses.length > 0 ? ") WHERE ".concat(toNodeNeo4jTypeClauses.join(' AND '), " ") : " {".concat(toParam, ": $to.").concat(toParam, "})"), "\n      CREATE (").concat(fromVariable, ")-[").concat(relationshipVariable, ":").concat(relationshipLabel).concat(paramStatements.length > 0 ? " {".concat(paramStatements.join(','), "}") : '', "]->(").concat(toVariable, ")\n      RETURN ").concat(relationshipVariable, " { ").concat(subQuery, " } AS ").concat(schemaTypeName, ";\n    ");
  return [query, params];
};

var relationshipDelete = function relationshipDelete(_ref17) {
  var resolveInfo = _ref17.resolveInfo,
      selections = _ref17.selections,
      schemaType = _ref17.schemaType,
      params = _ref17.params,
      context = _ref17.context;
  var mutationMeta, relationshipNameArg, fromTypeArg, toTypeArg;

  try {
    mutationMeta = resolveInfo.schema.getMutationType().getFields()[resolveInfo.fieldName].astNode.directives.find(function (x) {
      return x.name.value === 'MutationMeta';
    });
  } catch (e) {
    throw new Error('Missing required MutationMeta directive on add relationship directive');
  }

  try {
    relationshipNameArg = mutationMeta.arguments.find(function (x) {
      return x.name.value === 'relationship';
    });
    fromTypeArg = mutationMeta.arguments.find(function (x) {
      return x.name.value === 'from';
    });
    toTypeArg = mutationMeta.arguments.find(function (x) {
      return x.name.value === 'to';
    });
  } catch (e) {
    throw new Error('Missing required argument in MutationMeta directive (relationship, from, or to)');
  } //TODO: need to handle one-to-one and one-to-many


  var args = (0, _utils.getMutationArguments)(resolveInfo);
  var typeMap = resolveInfo.schema.getTypeMap();
  var cypherParams = getCypherParams(context);
  var fromType = fromTypeArg.value.value;
  var fromVar = "".concat((0, _utils.lowFirstLetter)(fromType), "_from");
  var fromInputArg = args.find(function (e) {
    return e.name.value === 'from';
  }).type;
  var fromInputAst = typeMap[(0, _graphql.getNamedType)(fromInputArg).type.name.value].astNode;
  var fromFields = fromInputAst.fields;
  var fromParam = fromFields[0].name.value;
  var fromNodeNeo4jTypeArgs = (0, _utils.getNeo4jTypeArguments)(fromFields);
  var toType = toTypeArg.value.value;
  var toVar = "".concat((0, _utils.lowFirstLetter)(toType), "_to");
  var toInputArg = args.find(function (e) {
    return e.name.value === 'to';
  }).type;
  var toInputAst = typeMap[(0, _graphql.getNamedType)(toInputArg).type.name.value].astNode;
  var toFields = toInputAst.fields;
  var toParam = toFields[0].name.value;
  var toNodeNeo4jTypeArgs = (0, _utils.getNeo4jTypeArguments)(toFields);
  var relationshipName = relationshipNameArg.value.value;
  var schemaTypeName = (0, _utils.safeVar)(schemaType);
  var fromVariable = (0, _utils.safeVar)(fromVar);
  var fromAdditionalLabels = (0, _utils.getAdditionalLabels)(resolveInfo.schema.getType(fromType), cypherParams);
  var fromLabel = (0, _utils.safeLabel)([fromType].concat((0, _toConsumableArray2["default"])(fromAdditionalLabels)));
  var toVariable = (0, _utils.safeVar)(toVar);
  var toAdditionalLabels = (0, _utils.getAdditionalLabels)(resolveInfo.schema.getType(toType), cypherParams);
  var toLabel = (0, _utils.safeLabel)([toType].concat((0, _toConsumableArray2["default"])(toAdditionalLabels)));
  var relationshipVariable = (0, _utils.safeVar)(fromVar + toVar);
  var relationshipLabel = (0, _utils.safeLabel)(relationshipName);
  var fromRootVariable = (0, _utils.safeVar)('_' + fromVar);
  var toRootVariable = (0, _utils.safeVar)('_' + toVar);
  var fromNodeNeo4jTypeClauses = (0, _utils.neo4jTypePredicateClauses)(params.from, fromVariable, fromNodeNeo4jTypeArgs, 'from');
  var toNodeNeo4jTypeClauses = (0, _utils.neo4jTypePredicateClauses)(params.to, toVariable, toNodeNeo4jTypeArgs, 'to'); // TODO cleaner semantics: remove use of _ prefixes in root variableNames and variableName

  var _buildCypherSelection13 = (0, _selections.buildCypherSelection)({
    selections: selections,
    schemaType: schemaType,
    resolveInfo: resolveInfo,
    parentSelectionInfo: {
      rootType: 'relationship',
      from: "_".concat(fromVar),
      to: "_".concat(toVar)
    },
    variableName: schemaType.name === fromType ? "_".concat(toVar) : "_".concat(fromVar),
    cypherParams: getCypherParams(context)
  }),
      _buildCypherSelection14 = (0, _slicedToArray2["default"])(_buildCypherSelection13, 2),
      subQuery = _buildCypherSelection14[0],
      subParams = _buildCypherSelection14[1];

  params = _objectSpread({}, params, {}, subParams);
  var query = "\n      MATCH (".concat(fromVariable, ":").concat(fromLabel).concat(fromNodeNeo4jTypeClauses && fromNodeNeo4jTypeClauses.length > 0 ? // uses either a WHERE clause for managed type primary keys (temporal, etc.)
  ") WHERE ".concat(fromNodeNeo4jTypeClauses.join(' AND '), " ") : // or a an internal matching clause for normal, scalar property primary keys
  " {".concat(fromParam, ": $from.").concat(fromParam, "})"), "\n      MATCH (").concat(toVariable, ":").concat(toLabel).concat(toNodeNeo4jTypeClauses && toNodeNeo4jTypeClauses.length > 0 ? ") WHERE ".concat(toNodeNeo4jTypeClauses.join(' AND '), " ") : " {".concat(toParam, ": $to.").concat(toParam, "})"), "\n      OPTIONAL MATCH (").concat(fromVariable, ")-[").concat(relationshipVariable, ":").concat(relationshipLabel, "]->(").concat(toVariable, ")\n      DELETE ").concat(relationshipVariable, "\n      WITH COUNT(*) AS scope, ").concat(fromVariable, " AS ").concat(fromRootVariable, ", ").concat(toVariable, " AS ").concat(toRootVariable, "\n      RETURN {").concat(subQuery, "} AS ").concat(schemaTypeName, ";\n    ");
  return [query, params];
};

var relationshipMergeOrUpdate = function relationshipMergeOrUpdate(_ref18) {
  var mutationMeta = _ref18.mutationMeta,
      resolveInfo = _ref18.resolveInfo,
      selections = _ref18.selections,
      schemaType = _ref18.schemaType,
      params = _ref18.params,
      context = _ref18.context;
  var query = '';
  var relationshipNameArg = undefined;
  var fromTypeArg = undefined;
  var toTypeArg = undefined;

  try {
    relationshipNameArg = mutationMeta.arguments.find(function (x) {
      return x.name.value === 'relationship';
    });
    fromTypeArg = mutationMeta.arguments.find(function (x) {
      return x.name.value === 'from';
    });
    toTypeArg = mutationMeta.arguments.find(function (x) {
      return x.name.value === 'to';
    });
  } catch (e) {
    throw new Error('Missing required argument in MutationMeta directive (relationship, from, or to)');
  }

  if (relationshipNameArg && fromTypeArg && toTypeArg) {
    //TODO: need to handle one-to-one and one-to-many
    var args = (0, _utils.getMutationArguments)(resolveInfo);
    var typeMap = resolveInfo.schema.getTypeMap();
    var cypherParams = getCypherParams(context);
    var fromType = fromTypeArg.value.value;
    var fromVar = "".concat((0, _utils.lowFirstLetter)(fromType), "_from");
    var fromInputArg = args.find(function (e) {
      return e.name.value === 'from';
    }).type;
    var fromInputAst = typeMap[(0, _graphql.getNamedType)(fromInputArg).type.name.value].astNode;
    var fromFields = fromInputAst.fields;
    var fromParam = fromFields[0].name.value;
    var fromNodeNeo4jTypeArgs = (0, _utils.getNeo4jTypeArguments)(fromFields);
    var toType = toTypeArg.value.value;
    var toVar = "".concat((0, _utils.lowFirstLetter)(toType), "_to");
    var toInputArg = args.find(function (e) {
      return e.name.value === 'to';
    }).type;
    var toInputAst = typeMap[(0, _graphql.getNamedType)(toInputArg).type.name.value].astNode;
    var toFields = toInputAst.fields;
    var toParam = toFields[0].name.value;
    var toNodeNeo4jTypeArgs = (0, _utils.getNeo4jTypeArguments)(toFields);
    var relationshipName = relationshipNameArg.value.value;
    var lowercased = relationshipName.toLowerCase();
    var dataInputArg = args.find(function (e) {
      return e.name.value === 'data';
    });
    var dataInputAst = dataInputArg ? typeMap[(0, _graphql.getNamedType)(dataInputArg.type).type.name.value].astNode : undefined;
    var dataFields = dataInputAst ? dataInputAst.fields : [];

    var _buildCypherParameter7 = (0, _utils.buildCypherParameters)({
      args: dataFields,
      params: params,
      paramKey: 'data',
      resolveInfo: resolveInfo
    }),
        _buildCypherParameter8 = (0, _slicedToArray2["default"])(_buildCypherParameter7, 2),
        preparedParams = _buildCypherParameter8[0],
        paramStatements = _buildCypherParameter8[1];

    var schemaTypeName = (0, _utils.safeVar)(schemaType);
    var fromVariable = (0, _utils.safeVar)(fromVar);
    var fromAdditionalLabels = (0, _utils.getAdditionalLabels)(resolveInfo.schema.getType(fromType), cypherParams);
    var fromLabel = (0, _utils.safeLabel)([fromType].concat((0, _toConsumableArray2["default"])(fromAdditionalLabels)));
    var toVariable = (0, _utils.safeVar)(toVar);
    var toAdditionalLabels = (0, _utils.getAdditionalLabels)(resolveInfo.schema.getType(toType), cypherParams);
    var toLabel = (0, _utils.safeLabel)([toType].concat((0, _toConsumableArray2["default"])(toAdditionalLabels)));
    var relationshipVariable = (0, _utils.safeVar)(lowercased + '_relation');
    var relationshipLabel = (0, _utils.safeLabel)(relationshipName);
    var fromNodeNeo4jTypeClauses = (0, _utils.neo4jTypePredicateClauses)(preparedParams.from, fromVariable, fromNodeNeo4jTypeArgs, 'from');
    var toNodeNeo4jTypeClauses = (0, _utils.neo4jTypePredicateClauses)(preparedParams.to, toVariable, toNodeNeo4jTypeArgs, 'to');

    var _buildCypherSelection15 = (0, _selections.buildCypherSelection)({
      selections: selections,
      schemaType: schemaType,
      resolveInfo: resolveInfo,
      parentSelectionInfo: {
        rootType: 'relationship',
        from: fromVar,
        to: toVar,
        variableName: lowercased
      },
      variableName: schemaType.name === fromType ? "".concat(toVar) : "".concat(fromVar),
      cypherParams: getCypherParams(context)
    }),
        _buildCypherSelection16 = (0, _slicedToArray2["default"])(_buildCypherSelection15, 2),
        subQuery = _buildCypherSelection16[0],
        subParams = _buildCypherSelection16[1];

    var cypherOperation = '';

    if ((0, _utils.isMergeMutation)(resolveInfo)) {
      cypherOperation = 'MERGE';
    } else if ((0, _utils.isUpdateMutation)(resolveInfo)) {
      cypherOperation = 'MATCH';
    }

    params = _objectSpread({}, preparedParams, {}, subParams);
    query = "\n      MATCH (".concat(fromVariable, ":").concat(fromLabel).concat(fromNodeNeo4jTypeClauses && fromNodeNeo4jTypeClauses.length > 0 ? // uses either a WHERE clause for managed type primary keys (temporal, etc.)
    ") WHERE ".concat(fromNodeNeo4jTypeClauses.join(' AND '), " ") : // or a an internal matching clause for normal, scalar property primary keys
    // NOTE this will need to change if we at some point allow for multi field node selection
    " {".concat(fromParam, ": $from.").concat(fromParam, "})"), "\n      MATCH (").concat(toVariable, ":").concat(toLabel).concat(toNodeNeo4jTypeClauses && toNodeNeo4jTypeClauses.length > 0 ? ") WHERE ".concat(toNodeNeo4jTypeClauses.join(' AND '), " ") : " {".concat(toParam, ": $to.").concat(toParam, "})"), "\n      ").concat(cypherOperation, " (").concat(fromVariable, ")-[").concat(relationshipVariable, ":").concat(relationshipLabel, "]->(").concat(toVariable, ")").concat(paramStatements.length > 0 ? "\n      SET ".concat(relationshipVariable, " += {").concat(paramStatements.join(','), "} ") : '', "\n      RETURN ").concat(relationshipVariable, " { ").concat(subQuery, " } AS ").concat(schemaTypeName, ";\n    ");
  }

  return [query, params];
};

var nodeMergeOrUpdate = function nodeMergeOrUpdate(_ref19) {
  var resolveInfo = _ref19.resolveInfo,
      variableName = _ref19.variableName,
      typeName = _ref19.typeName,
      selections = _ref19.selections,
      schemaType = _ref19.schemaType,
      additionalLabels = _ref19.additionalLabels,
      params = _ref19.params;
  var safeVariableName = (0, _utils.safeVar)(variableName);
  var safeLabelName = (0, _utils.safeLabel)([typeName].concat((0, _toConsumableArray2["default"])(additionalLabels)));
  var args = (0, _utils.getMutationArguments)(resolveInfo);
  var primaryKeyArg = args[0];
  var primaryKeyArgName = primaryKeyArg.name.value;
  var neo4jTypeArgs = (0, _utils.getNeo4jTypeArguments)(args);

  var _splitSelectionParame3 = (0, _utils.splitSelectionParameters)(params, primaryKeyArgName, 'params'),
      _splitSelectionParame4 = (0, _slicedToArray2["default"])(_splitSelectionParame3, 2),
      primaryKeyParam = _splitSelectionParame4[0],
      updateParams = _splitSelectionParame4[1];

  var neo4jTypeClauses = (0, _utils.neo4jTypePredicateClauses)(primaryKeyParam, safeVariableName, neo4jTypeArgs, 'params');
  var predicateClauses = (0, _toConsumableArray2["default"])(neo4jTypeClauses).filter(function (predicate) {
    return !!predicate;
  }).join(' AND ');
  var predicate = predicateClauses ? "WHERE ".concat(predicateClauses, " ") : '';

  var _buildCypherParameter9 = (0, _utils.buildCypherParameters)({
    args: args,
    params: updateParams,
    paramKey: 'params',
    resolveInfo: resolveInfo
  }),
      _buildCypherParameter10 = (0, _slicedToArray2["default"])(_buildCypherParameter9, 2),
      preparedParams = _buildCypherParameter10[0],
      paramUpdateStatements = _buildCypherParameter10[1];

  var cypherOperation = '';

  if ((0, _utils.isMergeMutation)(resolveInfo)) {
    cypherOperation = 'MERGE';
  } else if ((0, _utils.isUpdateMutation)(resolveInfo)) {
    cypherOperation = 'MATCH';
  }

  var query = "".concat(cypherOperation, " (").concat(safeVariableName, ":").concat(safeLabelName).concat(predicate !== '' ? ") ".concat(predicate, " ") : "{".concat(primaryKeyArgName, ": $params.").concat(primaryKeyArgName, "})"), "\n  ");

  if (paramUpdateStatements.length > 0) {
    query += "SET ".concat(safeVariableName, " += {").concat(paramUpdateStatements.join(','), "} ");
  }

  var _buildCypherSelection17 = (0, _selections.buildCypherSelection)({
    selections: selections,
    variableName: variableName,
    schemaType: schemaType,
    resolveInfo: resolveInfo
  }),
      _buildCypherSelection18 = (0, _slicedToArray2["default"])(_buildCypherSelection17, 2),
      subQuery = _buildCypherSelection18[0],
      subParams = _buildCypherSelection18[1];

  preparedParams.params[primaryKeyArgName] = primaryKeyParam[primaryKeyArgName];
  params = _objectSpread({}, preparedParams, {}, subParams);
  query += "RETURN ".concat(safeVariableName, " {").concat(subQuery, "} AS ").concat(safeVariableName);
  return [query, params];
};

var neo4jTypeOrderingClauses = function neo4jTypeOrderingClauses(selections, innerSchemaType) {
  // TODO use extractSelections instead?
  var selectedTypes = selections && selections[0] && selections[0].selectionSet ? selections[0].selectionSet.selections : [];
  return selectedTypes.reduce(function (temporalTypeFields, innerSelection) {
    // name of temporal type field
    var fieldName = innerSelection.name.value;
    var fieldTypeName = getFieldTypeName(innerSchemaType, fieldName);

    if ((0, _utils.isTemporalType)(fieldTypeName)) {
      var innerSelectedTypes = innerSelection.selectionSet ? innerSelection.selectionSet.selections : [];
      temporalTypeFields.push("".concat(fieldName, ": {").concat(innerSelectedTypes.reduce(function (temporalSubFields, t) {
        // temporal type subfields, year, minute, etc.
        var subFieldName = t.name.value;

        if (subFieldName === 'formatted') {
          temporalSubFields.push("".concat(subFieldName, ": toString(sortedElement.").concat(fieldName, ")"));
        } else {
          temporalSubFields.push("".concat(subFieldName, ": sortedElement.").concat(fieldName, ".").concat(subFieldName));
        }

        return temporalSubFields;
      }, []).join(','), "}"));
    }

    return temporalTypeFields;
  }, []).join(',');
};

var getFieldTypeName = function getFieldTypeName(schemaType, fieldName) {
  // TODO handle for fragments?
  var field = schemaType && fieldName ? schemaType.getFields()[fieldName] : undefined;
  return field ? field.type.name : '';
};

var temporalOrderingFieldExists = function temporalOrderingFieldExists(schemaType, filterParams) {
  var orderByParam = filterParams ? filterParams['orderBy'] : undefined;

  if (orderByParam) {
    orderByParam = orderByParam.value;
    if (!(0, _isArray["default"])(orderByParam)) orderByParam = [orderByParam];
    return orderByParam.find(function (e) {
      var fieldName = e.substring(0, e.lastIndexOf('_'));
      var fieldTypeName = getFieldTypeName(schemaType, fieldName);
      return (0, _utils.isTemporalType)(fieldTypeName);
    });
  }

  return undefined;
};

var buildSortMultiArgs = function buildSortMultiArgs(param) {
  var values = param ? param.value : [];
  var fieldName = '';
  if (!(0, _isArray["default"])(values)) values = [values];
  return values.map(function (e) {
    fieldName = e.substring(0, e.lastIndexOf('_'));
    return e.includes('_asc') ? "'^".concat(fieldName, "'") : "'".concat(fieldName, "'");
  }).join(',');
};

var processFilterArgument = function processFilterArgument(_ref20) {
  var fieldArgs = _ref20.fieldArgs,
      schemaType = _ref20.schemaType,
      variableName = _ref20.variableName,
      resolveInfo = _ref20.resolveInfo,
      params = _ref20.params,
      paramIndex = _ref20.paramIndex,
      _ref20$rootIsRelation = _ref20.rootIsRelationType,
      rootIsRelationType = _ref20$rootIsRelation === void 0 ? false : _ref20$rootIsRelation;
  var filterArg = fieldArgs.find(function (e) {
    return e.name.value === 'filter';
  });
  var filterValue = (0, _keys["default"])(params).length ? params['filter'] : undefined;
  var filterParamKey = paramIndex > 1 ? "".concat(paramIndex - 1, "_filter") : "filter";
  var filterCypherParam = "$".concat(filterParamKey);
  var translations = []; // if field has both a filter argument and argument data is provided

  if (filterArg && filterValue) {
    var schema = resolveInfo.schema;
    var typeName = (0, _graphql.getNamedType)(filterArg).type.name.value;
    var filterSchemaType = schema.getType(typeName); // get fields of filter type

    var typeFields = filterSchemaType.getFields();

    var _analyzeFilterArgumen = analyzeFilterArguments({
      filterValue: filterValue,
      typeFields: typeFields,
      variableName: variableName,
      filterCypherParam: filterCypherParam,
      schemaType: schemaType,
      schema: schema
    }),
        _analyzeFilterArgumen2 = (0, _slicedToArray2["default"])(_analyzeFilterArgumen, 2),
        filterFieldMap = _analyzeFilterArgumen2[0],
        serializedFilterParam = _analyzeFilterArgumen2[1];

    translations = translateFilterArguments({
      filterFieldMap: filterFieldMap,
      typeFields: typeFields,
      filterCypherParam: filterCypherParam,
      rootIsRelationType: rootIsRelationType,
      variableName: variableName,
      schemaType: schemaType,
      schema: schema
    });
    params = _objectSpread({}, params, (0, _defineProperty3["default"])({}, filterParamKey, serializedFilterParam));
  }

  return [translations, params];
};

var analyzeFilterArguments = function analyzeFilterArguments(_ref21) {
  var filterValue = _ref21.filterValue,
      typeFields = _ref21.typeFields,
      variableName = _ref21.variableName,
      filterCypherParam = _ref21.filterCypherParam,
      schemaType = _ref21.schemaType,
      schema = _ref21.schema;
  return (0, _entries["default"])(filterValue).reduce(function (_ref22, _ref23) {
    var _ref24 = (0, _slicedToArray2["default"])(_ref22, 2),
        filterFieldMap = _ref24[0],
        serializedParams = _ref24[1];

    var _ref25 = (0, _slicedToArray2["default"])(_ref23, 2),
        name = _ref25[0],
        value = _ref25[1];

    var _analyzeFilterArgumen3 = analyzeFilterArgument({
      field: typeFields[name],
      filterValue: value,
      filterValues: filterValue,
      fieldName: name,
      filterParam: filterCypherParam,
      variableName: variableName,
      schemaType: schemaType,
      schema: schema
    }),
        _analyzeFilterArgumen4 = (0, _slicedToArray2["default"])(_analyzeFilterArgumen3, 2),
        serializedValue = _analyzeFilterArgumen4[0],
        fieldMap = _analyzeFilterArgumen4[1];

    var filterParamName = serializeFilterFieldName(name, value);
    filterFieldMap[filterParamName] = fieldMap;
    serializedParams[filterParamName] = serializedValue;
    return [filterFieldMap, serializedParams];
  }, [{}, {}]);
};

var analyzeFilterArgument = function analyzeFilterArgument(_ref26) {
  var parentFieldName = _ref26.parentFieldName,
      field = _ref26.field,
      filterValue = _ref26.filterValue,
      fieldName = _ref26.fieldName,
      variableName = _ref26.variableName,
      filterParam = _ref26.filterParam,
      parentSchemaType = _ref26.parentSchemaType,
      schemaType = _ref26.schemaType,
      schema = _ref26.schema;
  var fieldType = field.type;
  var innerFieldType = (0, _utils.innerType)(fieldType);
  var typeName = innerFieldType.name;
  var parsedFilterName = parseFilterArgumentName(fieldName);
  var filterOperationField = parsedFilterName.name;
  var filterOperationType = parsedFilterName.type; // defaults

  var filterMapValue = true;
  var serializedFilterParam = filterValue;

  if ((0, _graphql.isScalarType)(innerFieldType) || (0, _graphql.isEnumType)(innerFieldType)) {
    if (isExistentialFilter(filterOperationType, filterValue)) {
      serializedFilterParam = true;
      filterMapValue = null;
    }
  } else if ((0, _graphql.isInputType)(innerFieldType)) {
    // check when filterSchemaType the same as schemaTypeField
    var filterSchemaType = schema.getType(typeName);
    var typeFields = filterSchemaType.getFields();

    if (fieldName === 'AND' || fieldName === 'OR') {
      // recursion
      var _analyzeNestedFilterA = analyzeNestedFilterArgument({
        filterValue: filterValue,
        filterOperationType: filterOperationType,
        parentFieldName: fieldName,
        parentSchemaType: schemaType,
        schemaType: schemaType,
        variableName: variableName,
        filterParam: filterParam,
        typeFields: typeFields,
        schema: schema
      });

      var _analyzeNestedFilterA2 = (0, _slicedToArray2["default"])(_analyzeNestedFilterA, 2);

      serializedFilterParam = _analyzeNestedFilterA2[0];
      filterMapValue = _analyzeNestedFilterA2[1];
    } else {
      var schemaTypeField = schemaType.getFields()[filterOperationField];
      var innerSchemaType = (0, _utils.innerType)(schemaTypeField.type);

      if ((0, _graphql.isObjectType)(innerSchemaType)) {
        var _decideRelationFilter = decideRelationFilterMetadata({
          fieldName: fieldName,
          parentSchemaType: parentSchemaType,
          schemaType: schemaType,
          variableName: variableName,
          innerSchemaType: innerSchemaType,
          filterOperationField: filterOperationField
        }),
            _decideRelationFilter2 = (0, _slicedToArray2["default"])(_decideRelationFilter, 9),
            thisType = _decideRelationFilter2[0],
            relatedType = _decideRelationFilter2[1],
            relationLabel = _decideRelationFilter2[2],
            relationDirection = _decideRelationFilter2[3],
            isRelation = _decideRelationFilter2[4],
            isRelationType = _decideRelationFilter2[5],
            isRelationTypeNode = _decideRelationFilter2[6],
            isReflexiveRelationType = _decideRelationFilter2[7],
            isReflexiveTypeDirectedField = _decideRelationFilter2[8];

        if (isReflexiveTypeDirectedField) {
          // for the 'from' and 'to' fields on the payload of a reflexive
          // relation type to use the parent field name, ex: 'knows_some'
          // is used for 'from' and 'to' in 'knows_some: { from: {}, to: {} }'
          var _parsedFilterName = parseFilterArgumentName(parentFieldName);

          filterOperationField = _parsedFilterName.name;
          filterOperationType = _parsedFilterName.type;
        }

        if (isExistentialFilter(filterOperationType, filterValue)) {
          serializedFilterParam = true;
          filterMapValue = null;
        } else if ((0, _utils.isNeo4jTypeInput)(typeName)) {
          serializedFilterParam = serializeNeo4jTypeParam(filterValue);
        } else if (isRelation || isRelationType || isRelationTypeNode) {
          // recursion
          var _analyzeNestedFilterA3 = analyzeNestedFilterArgument({
            filterValue: filterValue,
            filterOperationType: filterOperationType,
            isRelationType: isRelationType,
            parentFieldName: fieldName,
            parentSchemaType: schemaType,
            schemaType: innerSchemaType,
            variableName: variableName,
            filterParam: filterParam,
            typeFields: typeFields,
            schema: schema
          });

          var _analyzeNestedFilterA4 = (0, _slicedToArray2["default"])(_analyzeNestedFilterA3, 2);

          serializedFilterParam = _analyzeNestedFilterA4[0];
          filterMapValue = _analyzeNestedFilterA4[1];
        }
      }
    }
  }

  return [serializedFilterParam, filterMapValue];
};

var analyzeNestedFilterArgument = function analyzeNestedFilterArgument(_ref27) {
  var parentSchemaType = _ref27.parentSchemaType,
      parentFieldName = _ref27.parentFieldName,
      schemaType = _ref27.schemaType,
      variableName = _ref27.variableName,
      filterValue = _ref27.filterValue,
      filterParam = _ref27.filterParam,
      typeFields = _ref27.typeFields,
      schema = _ref27.schema;
  var isList = (0, _isArray["default"])(filterValue); // coersion to array for dynamic iteration of objects and arrays

  if (!isList) filterValue = [filterValue];
  var serializedFilterValue = [];
  var filterValueFieldMap = {};
  filterValue.forEach(function (filter) {
    var serializedValues = {};
    var serializedValue = {};
    var valueFieldMap = {};
    (0, _entries["default"])(filter).forEach(function (_ref28) {
      var _ref29 = (0, _slicedToArray2["default"])(_ref28, 2),
          fieldName = _ref29[0],
          value = _ref29[1];

      fieldName = deserializeFilterFieldName(fieldName);

      var _analyzeFilterArgumen5 = analyzeFilterArgument({
        parentFieldName: parentFieldName,
        field: typeFields[fieldName],
        filterValue: value,
        filterValues: filter,
        fieldName: fieldName,
        variableName: variableName,
        filterParam: filterParam,
        parentSchemaType: parentSchemaType,
        schemaType: schemaType,
        schema: schema
      });

      var _analyzeFilterArgumen6 = (0, _slicedToArray2["default"])(_analyzeFilterArgumen5, 2);

      serializedValue = _analyzeFilterArgumen6[0];
      valueFieldMap = _analyzeFilterArgumen6[1];
      var filterParamName = serializeFilterFieldName(fieldName, value);
      var filterMapEntry = filterValueFieldMap[filterParamName];
      if (!filterMapEntry) filterValueFieldMap[filterParamName] = valueFieldMap; // deep merges in order to capture differences in objects within nested array filters
      else filterValueFieldMap[filterParamName] = _lodash["default"].merge(filterMapEntry, valueFieldMap);
      serializedValues[filterParamName] = serializedValue;
    });
    serializedFilterValue.push(serializedValues);
  }); // undo array coersion

  if (!isList) serializedFilterValue = serializedFilterValue[0];
  return [serializedFilterValue, filterValueFieldMap];
};

var serializeFilterFieldName = function serializeFilterFieldName(name, value) {
  if (value === null) {
    var parsedFilterName = parseFilterArgumentName(name);
    var filterOperationType = parsedFilterName.type;

    if (!filterOperationType || filterOperationType === 'not') {
      return "_".concat(name, "_null");
    }
  }

  return name;
};

var serializeNeo4jTypeParam = function serializeNeo4jTypeParam(filterValue) {
  var isList = (0, _isArray["default"])(filterValue);
  if (!isList) filterValue = [filterValue];
  var serializedValues = filterValue.reduce(function (serializedValues, filter) {
    var serializedValue = {};
    if (filter['formatted']) serializedValue = filter['formatted'];else {
      serializedValue = (0, _entries["default"])(filter).reduce(function (serialized, _ref30) {
        var _ref31 = (0, _slicedToArray2["default"])(_ref30, 2),
            key = _ref31[0],
            value = _ref31[1];

        if ((0, _isInteger["default"])(value)) value = _neo4jDriver["default"]["int"](value);
        serialized[key] = value;
        return serialized;
      }, {});
    }
    serializedValues.push(serializedValue);
    return serializedValues;
  }, []);
  if (!isList) serializedValues = serializedValues[0];
  return serializedValues;
};

var deserializeFilterFieldName = function deserializeFilterFieldName(name) {
  if (name.startsWith('_') && name.endsWith('_null')) {
    name = name.substring(1, name.length - 5);
  }

  return name;
};

var translateFilterArguments = function translateFilterArguments(_ref32) {
  var filterFieldMap = _ref32.filterFieldMap,
      typeFields = _ref32.typeFields,
      filterCypherParam = _ref32.filterCypherParam,
      variableName = _ref32.variableName,
      rootIsRelationType = _ref32.rootIsRelationType,
      schemaType = _ref32.schemaType,
      schema = _ref32.schema;
  return (0, _entries["default"])(filterFieldMap).reduce(function (translations, _ref33) {
    var _ref34 = (0, _slicedToArray2["default"])(_ref33, 2),
        name = _ref34[0],
        value = _ref34[1];

    // the filter field map uses serialized field names to allow for both field: {} and field: null
    name = deserializeFilterFieldName(name);
    var translation = translateFilterArgument({
      field: typeFields[name],
      filterParam: filterCypherParam,
      fieldName: name,
      filterValue: value,
      rootIsRelationType: rootIsRelationType,
      variableName: variableName,
      schemaType: schemaType,
      schema: schema
    });

    if (translation) {
      translations.push("(".concat(translation, ")"));
    }

    return translations;
  }, []);
};

var translateFilterArgument = function translateFilterArgument(_ref35) {
  var parentParamPath = _ref35.parentParamPath,
      parentFieldName = _ref35.parentFieldName,
      isListFilterArgument = _ref35.isListFilterArgument,
      field = _ref35.field,
      filterValue = _ref35.filterValue,
      fieldName = _ref35.fieldName,
      rootIsRelationType = _ref35.rootIsRelationType,
      variableName = _ref35.variableName,
      filterParam = _ref35.filterParam,
      parentSchemaType = _ref35.parentSchemaType,
      schemaType = _ref35.schemaType,
      schema = _ref35.schema;
  var fieldType = field.type;
  var innerFieldType = (0, _utils.innerType)(fieldType); // get name of filter field type (ex: _PersonFilter)

  var typeName = innerFieldType.name; // build path for parameter data for current filter field

  var parameterPath = "".concat(parentParamPath ? parentParamPath : filterParam, ".").concat(fieldName); // parse field name into prefix (ex: name, company) and
  // possible suffix identifying operation type (ex: _gt, _in)

  var parsedFilterName = parseFilterArgumentName(fieldName);
  var filterOperationField = parsedFilterName.name;
  var filterOperationType = parsedFilterName.type; // short-circuit evaluation: predicate used to skip a field
  // if processing a list of objects that possibly contain different arguments

  var nullFieldPredicate = decideNullSkippingPredicate({
    parameterPath: parameterPath,
    isListFilterArgument: isListFilterArgument,
    parentParamPath: parentParamPath
  });
  var translation = '';

  if ((0, _graphql.isScalarType)(innerFieldType) || (0, _graphql.isEnumType)(innerFieldType)) {
    translation = translateScalarFilter({
      isListFilterArgument: isListFilterArgument,
      filterOperationField: filterOperationField,
      filterOperationType: filterOperationType,
      filterValue: filterValue,
      fieldName: fieldName,
      variableName: variableName,
      parameterPath: parameterPath,
      parentParamPath: parentParamPath,
      filterParam: filterParam,
      nullFieldPredicate: nullFieldPredicate
    });
  } else if ((0, _graphql.isInputType)(innerFieldType)) {
    translation = translateInputFilter({
      rootIsRelationType: rootIsRelationType,
      isListFilterArgument: isListFilterArgument,
      filterOperationField: filterOperationField,
      filterOperationType: filterOperationType,
      filterValue: filterValue,
      variableName: variableName,
      fieldName: fieldName,
      filterParam: filterParam,
      typeName: typeName,
      fieldType: fieldType,
      schema: schema,
      parentSchemaType: parentSchemaType,
      schemaType: schemaType,
      parameterPath: parameterPath,
      parentParamPath: parentParamPath,
      parentFieldName: parentFieldName,
      nullFieldPredicate: nullFieldPredicate
    });
  }

  return translation;
};

var parseFilterArgumentName = function parseFilterArgumentName(fieldName) {
  var fieldNameParts = fieldName.split('_');
  var filterTypes = ['_not', '_in', '_not_in', '_contains', '_not_contains', '_starts_with', '_not_starts_with', '_ends_with', '_not_ends_with', '_lt', '_lte', '_gt', '_gte', '_some', '_none', '_single', '_every', '_distance', '_distance_lt', '_distance_lte', '_distance_gt', '_distance_gte'];
  var filterType = '';

  if (fieldNameParts.length > 1) {
    var regExp = [];

    _lodash["default"].each(filterTypes, function (f) {
      regExp.push(f + '$');
    });

    var regExpJoin = '(' + regExp.join('|') + ')';

    var preparedFieldAndFilterField = _lodash["default"].replace(fieldName, new RegExp(regExpJoin), '[::filterFieldSeperator::]$1');

    var _preparedFieldAndFilt = preparedFieldAndFilterField.split('[::filterFieldSeperator::]'),
        _preparedFieldAndFilt2 = (0, _slicedToArray2["default"])(_preparedFieldAndFilt, 2),
        parsedField = _preparedFieldAndFilt2[0],
        parsedFilterField = _preparedFieldAndFilt2[1];

    fieldName = !_lodash["default"].isUndefined(parsedField) ? parsedField : fieldName;
    filterType = !_lodash["default"].isUndefined(parsedFilterField) ? parsedFilterField.substr(1) : ''; // Strip off first underscore
  }

  return {
    name: fieldName,
    type: filterType
  };
};

var translateScalarFilter = function translateScalarFilter(_ref36) {
  var isListFilterArgument = _ref36.isListFilterArgument,
      filterOperationField = _ref36.filterOperationField,
      filterOperationType = _ref36.filterOperationType,
      filterValue = _ref36.filterValue,
      variableName = _ref36.variableName,
      parameterPath = _ref36.parameterPath,
      parentParamPath = _ref36.parentParamPath,
      filterParam = _ref36.filterParam,
      nullFieldPredicate = _ref36.nullFieldPredicate;
  // build path to node/relationship property
  var propertyPath = "".concat((0, _utils.safeVar)(variableName), ".").concat(filterOperationField);

  if (isExistentialFilter(filterOperationType, filterValue)) {
    return translateNullFilter({
      filterOperationField: filterOperationField,
      filterOperationType: filterOperationType,
      propertyPath: propertyPath,
      filterParam: filterParam,
      parentParamPath: parentParamPath,
      isListFilterArgument: isListFilterArgument
    });
  }

  return "".concat(nullFieldPredicate).concat(buildOperatorExpression({
    filterOperationType: filterOperationType,
    propertyPath: propertyPath
  }), " ").concat(parameterPath);
};

var isExistentialFilter = function isExistentialFilter(type, value) {
  return (!type || type === 'not') && value === null;
};

var decideNullSkippingPredicate = function decideNullSkippingPredicate(_ref37) {
  var parameterPath = _ref37.parameterPath,
      isListFilterArgument = _ref37.isListFilterArgument,
      parentParamPath = _ref37.parentParamPath;
  return isListFilterArgument && parentParamPath ? "".concat(parameterPath, " IS NULL OR ") : '';
};

var translateNullFilter = function translateNullFilter(_ref38) {
  var filterOperationField = _ref38.filterOperationField,
      filterOperationType = _ref38.filterOperationType,
      filterParam = _ref38.filterParam,
      propertyPath = _ref38.propertyPath,
      parentParamPath = _ref38.parentParamPath,
      isListFilterArgument = _ref38.isListFilterArgument;
  var isNegationFilter = filterOperationType === 'not'; // allign with modified parameter names for null filters

  var paramPath = "".concat(parentParamPath ? parentParamPath : filterParam, "._").concat(filterOperationField, "_").concat(isNegationFilter ? "not_" : '', "null"); // build a predicate for checking the existence of a
  // property or relationship

  var predicate = "".concat(paramPath, " = TRUE AND").concat(isNegationFilter ? '' : ' NOT', " EXISTS(").concat(propertyPath, ")"); // skip the field if it is null in the case of it
  // existing within one of many objects in a list filter

  var nullFieldPredicate = decideNullSkippingPredicate({
    parameterPath: paramPath,
    isListFilterArgument: isListFilterArgument,
    parentParamPath: parentParamPath
  });
  return "".concat(nullFieldPredicate).concat(predicate);
};

var buildOperatorExpression = function buildOperatorExpression(_ref39) {
  var filterOperationType = _ref39.filterOperationType,
      propertyPath = _ref39.propertyPath,
      isListFilterArgument = _ref39.isListFilterArgument,
      parameterPath = _ref39.parameterPath;
  if (isListFilterArgument) return "".concat(propertyPath, " =");

  switch (filterOperationType) {
    case 'not':
      return "NOT ".concat(propertyPath, " = ");

    case 'in':
      return "".concat(propertyPath, " IN");

    case 'not_in':
      return "NOT ".concat(propertyPath, " IN");

    case 'contains':
      return "".concat(propertyPath, " CONTAINS");

    case 'not_contains':
      return "NOT ".concat(propertyPath, " CONTAINS");

    case 'starts_with':
      return "".concat(propertyPath, " STARTS WITH");

    case 'not_starts_with':
      return "NOT ".concat(propertyPath, " STARTS WITH");

    case 'ends_with':
      return "".concat(propertyPath, " ENDS WITH");

    case 'not_ends_with':
      return "NOT ".concat(propertyPath, " ENDS WITH");

    case 'distance':
      return "distance(".concat(propertyPath, ", point(").concat(parameterPath, ".point)) =");

    case 'lt':
      return "".concat(propertyPath, " <");

    case 'distance_lt':
      return "distance(".concat(propertyPath, ", point(").concat(parameterPath, ".point)) <");

    case 'lte':
      return "".concat(propertyPath, " <=");

    case 'distance_lte':
      return "distance(".concat(propertyPath, ", point(").concat(parameterPath, ".point)) <=");

    case 'gt':
      return "".concat(propertyPath, " >");

    case 'distance_gt':
      return "distance(".concat(propertyPath, ", point(").concat(parameterPath, ".point)) >");

    case 'gte':
      return "".concat(propertyPath, " >=");

    case 'distance_gte':
      return "distance(".concat(propertyPath, ", point(").concat(parameterPath, ".point)) >=");

    default:
      {
        return "".concat(propertyPath, " =");
      }
  }
};

var translateInputFilter = function translateInputFilter(_ref40) {
  var rootIsRelationType = _ref40.rootIsRelationType,
      isListFilterArgument = _ref40.isListFilterArgument,
      filterOperationField = _ref40.filterOperationField,
      filterOperationType = _ref40.filterOperationType,
      filterValue = _ref40.filterValue,
      variableName = _ref40.variableName,
      fieldName = _ref40.fieldName,
      filterParam = _ref40.filterParam,
      typeName = _ref40.typeName,
      fieldType = _ref40.fieldType,
      schema = _ref40.schema,
      parentSchemaType = _ref40.parentSchemaType,
      schemaType = _ref40.schemaType,
      parameterPath = _ref40.parameterPath,
      parentParamPath = _ref40.parentParamPath,
      parentFieldName = _ref40.parentFieldName,
      nullFieldPredicate = _ref40.nullFieldPredicate;
  // check when filterSchemaType the same as schemaTypeField
  var filterSchemaType = schema.getType(typeName);
  var typeFields = filterSchemaType.getFields();

  if (fieldName === 'AND' || fieldName === 'OR') {
    return translateLogicalFilter({
      filterValue: filterValue,
      variableName: variableName,
      filterOperationType: filterOperationType,
      filterOperationField: filterOperationField,
      fieldName: fieldName,
      filterParam: filterParam,
      typeFields: typeFields,
      schema: schema,
      schemaType: schemaType,
      parameterPath: parameterPath,
      nullFieldPredicate: nullFieldPredicate
    });
  } else {
    var schemaTypeField = schemaType.getFields()[filterOperationField];
    var innerSchemaType = (0, _utils.innerType)(schemaTypeField.type);

    if ((0, _graphql.isObjectType)(innerSchemaType)) {
      var _decideRelationFilter3 = decideRelationFilterMetadata({
        fieldName: fieldName,
        parentSchemaType: parentSchemaType,
        schemaType: schemaType,
        variableName: variableName,
        innerSchemaType: innerSchemaType,
        filterOperationField: filterOperationField
      }),
          _decideRelationFilter4 = (0, _slicedToArray2["default"])(_decideRelationFilter3, 9),
          thisType = _decideRelationFilter4[0],
          relatedType = _decideRelationFilter4[1],
          relationLabel = _decideRelationFilter4[2],
          relationDirection = _decideRelationFilter4[3],
          isRelation = _decideRelationFilter4[4],
          isRelationType = _decideRelationFilter4[5],
          isRelationTypeNode = _decideRelationFilter4[6],
          isReflexiveRelationType = _decideRelationFilter4[7],
          isReflexiveTypeDirectedField = _decideRelationFilter4[8];

      if ((0, _utils.isNeo4jTypeInput)(typeName)) {
        return translateNeo4jTypeFilter({
          typeName: typeName,
          isRelationTypeNode: isRelationTypeNode,
          filterValue: filterValue,
          variableName: variableName,
          filterOperationField: filterOperationField,
          filterOperationType: filterOperationType,
          fieldName: fieldName,
          filterParam: filterParam,
          fieldType: fieldType,
          parameterPath: parameterPath,
          parentParamPath: parentParamPath,
          isListFilterArgument: isListFilterArgument,
          nullFieldPredicate: nullFieldPredicate
        });
      } else if (isRelation || isRelationType || isRelationTypeNode) {
        return translateRelationFilter({
          rootIsRelationType: rootIsRelationType,
          thisType: thisType,
          relatedType: relatedType,
          relationLabel: relationLabel,
          relationDirection: relationDirection,
          isRelationType: isRelationType,
          isRelationTypeNode: isRelationTypeNode,
          isReflexiveRelationType: isReflexiveRelationType,
          isReflexiveTypeDirectedField: isReflexiveTypeDirectedField,
          filterValue: filterValue,
          variableName: variableName,
          filterOperationField: filterOperationField,
          filterOperationType: filterOperationType,
          fieldName: fieldName,
          filterParam: filterParam,
          typeFields: typeFields,
          fieldType: fieldType,
          schema: schema,
          schemaType: schemaType,
          innerSchemaType: innerSchemaType,
          parameterPath: parameterPath,
          parentParamPath: parentParamPath,
          isListFilterArgument: isListFilterArgument,
          nullFieldPredicate: nullFieldPredicate,
          parentSchemaType: parentSchemaType,
          parentFieldName: parentFieldName
        });
      }
    }
  }
};

var translateLogicalFilter = function translateLogicalFilter(_ref41) {
  var filterValue = _ref41.filterValue,
      variableName = _ref41.variableName,
      filterOperationType = _ref41.filterOperationType,
      filterOperationField = _ref41.filterOperationField,
      fieldName = _ref41.fieldName,
      filterParam = _ref41.filterParam,
      typeFields = _ref41.typeFields,
      schema = _ref41.schema,
      schemaType = _ref41.schemaType,
      parameterPath = _ref41.parameterPath,
      nullFieldPredicate = _ref41.nullFieldPredicate;
  var listElementVariable = "_".concat(fieldName); // build predicate expressions for all unique arguments within filterValue
  // isListFilterArgument is true here so that nullFieldPredicate is used

  var predicates = buildFilterPredicates({
    filterOperationType: filterOperationType,
    parentFieldName: fieldName,
    listVariable: listElementVariable,
    parentSchemaType: schemaType,
    isListFilterArgument: true,
    schemaType: schemaType,
    variableName: variableName,
    filterValue: filterValue,
    filterParam: filterParam,
    typeFields: typeFields,
    schema: schema
  });
  var predicateListVariable = parameterPath; // decide root predicate function

  var rootPredicateFunction = decidePredicateFunction({
    filterOperationField: filterOperationField
  }); // build root predicate expression

  var translation = buildPredicateFunction({
    nullFieldPredicate: nullFieldPredicate,
    predicateListVariable: predicateListVariable,
    rootPredicateFunction: rootPredicateFunction,
    predicates: predicates,
    listElementVariable: listElementVariable
  });
  return translation;
};

var translateRelationFilter = function translateRelationFilter(_ref42) {
  var rootIsRelationType = _ref42.rootIsRelationType,
      thisType = _ref42.thisType,
      relatedType = _ref42.relatedType,
      relationLabel = _ref42.relationLabel,
      relationDirection = _ref42.relationDirection,
      isRelationType = _ref42.isRelationType,
      isRelationTypeNode = _ref42.isRelationTypeNode,
      isReflexiveRelationType = _ref42.isReflexiveRelationType,
      isReflexiveTypeDirectedField = _ref42.isReflexiveTypeDirectedField,
      filterValue = _ref42.filterValue,
      variableName = _ref42.variableName,
      filterOperationField = _ref42.filterOperationField,
      filterOperationType = _ref42.filterOperationType,
      fieldName = _ref42.fieldName,
      filterParam = _ref42.filterParam,
      typeFields = _ref42.typeFields,
      fieldType = _ref42.fieldType,
      schema = _ref42.schema,
      schemaType = _ref42.schemaType,
      innerSchemaType = _ref42.innerSchemaType,
      parameterPath = _ref42.parameterPath,
      parentParamPath = _ref42.parentParamPath,
      isListFilterArgument = _ref42.isListFilterArgument,
      nullFieldPredicate = _ref42.nullFieldPredicate,
      parentSchemaType = _ref42.parentSchemaType,
      parentFieldName = _ref42.parentFieldName;

  if (isReflexiveTypeDirectedField) {
    // when at the 'from' or 'to' fields of a reflexive relation type payload
    // we need to use the name of the parent schema type, ex: 'person' for
    // Person.knows gets used here for reflexive path patterns, rather than
    // the normally set 'person_filter_person' variableName
    variableName = parentSchemaType.name.toLowerCase();
  }

  var pathExistencePredicate = buildRelationExistencePath(variableName, relationLabel, relationDirection, relatedType, isRelationTypeNode);

  if (isExistentialFilter(filterOperationType, filterValue)) {
    return translateNullFilter({
      filterOperationField: filterOperationField,
      filterOperationType: filterOperationType,
      propertyPath: pathExistencePredicate,
      filterParam: filterParam,
      parentParamPath: parentParamPath,
      isListFilterArgument: isListFilterArgument
    });
  }

  if (isReflexiveTypeDirectedField) {
    // causes the 'from' and 'to' fields on the payload of a reflexive
    // relation type to use the parent field name, ex: 'knows_some'
    // is used for 'from' and 'to' in 'knows_some: { from: {}, to: {} }'
    var parsedFilterName = parseFilterArgumentName(parentFieldName);
    filterOperationField = parsedFilterName.name;
    filterOperationType = parsedFilterName.type;
  } // build a list comprehension containing path pattern for related type


  var predicateListVariable = buildRelatedTypeListComprehension({
    rootIsRelationType: rootIsRelationType,
    variableName: variableName,
    thisType: thisType,
    relatedType: relatedType,
    relationLabel: relationLabel,
    relationDirection: relationDirection,
    isRelationTypeNode: isRelationTypeNode,
    isRelationType: isRelationType
  });
  var rootPredicateFunction = decidePredicateFunction({
    isRelationTypeNode: isRelationTypeNode,
    filterOperationField: filterOperationField,
    filterOperationType: filterOperationType
  });
  return buildRelationPredicate({
    rootIsRelationType: rootIsRelationType,
    isRelationType: isRelationType,
    isListFilterArgument: isListFilterArgument,
    isReflexiveRelationType: isReflexiveRelationType,
    isReflexiveTypeDirectedField: isReflexiveTypeDirectedField,
    thisType: thisType,
    relatedType: relatedType,
    schemaType: schemaType,
    innerSchemaType: innerSchemaType,
    fieldName: fieldName,
    fieldType: fieldType,
    filterOperationType: filterOperationType,
    filterValue: filterValue,
    filterParam: filterParam,
    typeFields: typeFields,
    schema: schema,
    parameterPath: parameterPath,
    nullFieldPredicate: nullFieldPredicate,
    pathExistencePredicate: pathExistencePredicate,
    predicateListVariable: predicateListVariable,
    rootPredicateFunction: rootPredicateFunction
  });
};

var decideRelationFilterMetadata = function decideRelationFilterMetadata(_ref43) {
  var fieldName = _ref43.fieldName,
      parentSchemaType = _ref43.parentSchemaType,
      schemaType = _ref43.schemaType,
      variableName = _ref43.variableName,
      innerSchemaType = _ref43.innerSchemaType,
      filterOperationField = _ref43.filterOperationField;
  var thisType = '';
  var relatedType = '';
  var isRelation = false;
  var isRelationType = false;
  var isRelationTypeNode = false;
  var isReflexiveRelationType = false;
  var isReflexiveTypeDirectedField = false; // @relation field directive

  var _relationDirective = (0, _utils.relationDirective)(schemaType, filterOperationField),
      relLabel = _relationDirective.name,
      relDirection = _relationDirective.direction; // @relation type directive on node type field


  var innerRelationTypeDirective = (0, _utils.getRelationTypeDirective)(innerSchemaType.astNode); // @relation type directive on this type; node type field on relation type
  // If there is no @relation directive on the schemaType, check the parentSchemaType
  // for the same directive obtained above when the relation type is first seen

  var relationTypeDirective = (0, _utils.getRelationTypeDirective)(schemaType.astNode);

  if (relLabel && relDirection) {
    isRelation = true;
    var typeVariables = (0, _utils.typeIdentifiers)(innerSchemaType);
    thisType = schemaType.name;
    relatedType = typeVariables.typeName;
  } else if (innerRelationTypeDirective) {
    isRelationType = true;

    var _decideRelationTypeDi = decideRelationTypeDirection(schemaType, innerRelationTypeDirective);

    var _decideRelationTypeDi2 = (0, _slicedToArray2["default"])(_decideRelationTypeDi, 3);

    thisType = _decideRelationTypeDi2[0];
    relatedType = _decideRelationTypeDi2[1];
    relDirection = _decideRelationTypeDi2[2];

    if (thisType === relatedType) {
      isReflexiveRelationType = true;

      if (fieldName === 'from') {
        isReflexiveTypeDirectedField = true;
        relDirection = 'IN';
      } else if (fieldName === 'to') {
        isReflexiveTypeDirectedField = true;
        relDirection = 'OUT';
      }
    }

    relLabel = innerRelationTypeDirective.name;
  } else if (relationTypeDirective) {
    isRelationTypeNode = true;

    var _decideRelationTypeDi3 = decideRelationTypeDirection(parentSchemaType, relationTypeDirective);

    var _decideRelationTypeDi4 = (0, _slicedToArray2["default"])(_decideRelationTypeDi3, 3);

    thisType = _decideRelationTypeDi4[0];
    relatedType = _decideRelationTypeDi4[1];
    relDirection = _decideRelationTypeDi4[2];
    relLabel = variableName;
  }

  return [thisType, relatedType, relLabel, relDirection, isRelation, isRelationType, isRelationTypeNode, isReflexiveRelationType, isReflexiveTypeDirectedField];
};

var decideRelationTypeDirection = function decideRelationTypeDirection(schemaType, relationTypeDirective) {
  var fromType = relationTypeDirective.from;
  var toType = relationTypeDirective.to;
  var relDirection = 'OUT';

  if (fromType !== toType) {
    if (schemaType && schemaType.name === toType) {
      var temp = fromType;
      fromType = toType;
      toType = temp;
      relDirection = 'IN';
    }
  }

  return [fromType, toType, relDirection];
};

var buildRelationPredicate = function buildRelationPredicate(_ref44) {
  var rootIsRelationType = _ref44.rootIsRelationType,
      isRelationType = _ref44.isRelationType,
      isReflexiveRelationType = _ref44.isReflexiveRelationType,
      isReflexiveTypeDirectedField = _ref44.isReflexiveTypeDirectedField,
      thisType = _ref44.thisType,
      isListFilterArgument = _ref44.isListFilterArgument,
      relatedType = _ref44.relatedType,
      schemaType = _ref44.schemaType,
      innerSchemaType = _ref44.innerSchemaType,
      fieldName = _ref44.fieldName,
      fieldType = _ref44.fieldType,
      filterOperationType = _ref44.filterOperationType,
      filterValue = _ref44.filterValue,
      filterParam = _ref44.filterParam,
      typeFields = _ref44.typeFields,
      schema = _ref44.schema,
      parameterPath = _ref44.parameterPath,
      nullFieldPredicate = _ref44.nullFieldPredicate,
      pathExistencePredicate = _ref44.pathExistencePredicate,
      predicateListVariable = _ref44.predicateListVariable,
      rootPredicateFunction = _ref44.rootPredicateFunction;
  var relationVariable = buildRelationVariable(thisType, relatedType);
  var isRelationList = (0, _graphql.isListType)(fieldType);
  var variableName = relatedType.toLowerCase();
  var listVariable = parameterPath;

  if (rootIsRelationType || isRelationType) {
    // change the variable to be used in filtering
    // to the appropriate relationship variable
    // ex: project -> person_filter_project
    variableName = relationVariable;
  }

  if (isRelationList) {
    // set the base list comprehension variable
    // to point at each array element instead
    // ex: $filter.company_in -> _company_in
    listVariable = "_".concat(fieldName); // set to list to enable null field
    // skipping for all child filters

    isListFilterArgument = true;
  }

  var predicates = buildFilterPredicates({
    parentFieldName: fieldName,
    parentSchemaType: schemaType,
    schemaType: innerSchemaType,
    variableName: variableName,
    isListFilterArgument: isListFilterArgument,
    listVariable: listVariable,
    filterOperationType: filterOperationType,
    isRelationType: isRelationType,
    filterValue: filterValue,
    filterParam: filterParam,
    typeFields: typeFields,
    schema: schema
  });

  if (isRelationList) {
    predicates = buildPredicateFunction({
      predicateListVariable: parameterPath,
      listElementVariable: listVariable,
      rootPredicateFunction: rootPredicateFunction,
      predicates: predicates
    });
    rootPredicateFunction = decidePredicateFunction({
      isRelationList: isRelationList
    });
  }

  if (isReflexiveRelationType && !isReflexiveTypeDirectedField) {
    // At reflexive relation type fields, sufficient predicates and values are already
    // obtained from the above call to the recursive buildFilterPredicates
    // ex: Person.knows, Person.knows_in, etc.
    // Note: Since only the internal 'from' and 'to' fields are translated for reflexive
    // relation types, their translations will use the fieldName and schema type name
    // of this field. See: the top of translateRelationFilter
    return predicates;
  }

  var listElementVariable = (0, _utils.safeVar)(variableName);
  return buildPredicateFunction({
    nullFieldPredicate: nullFieldPredicate,
    pathExistencePredicate: pathExistencePredicate,
    predicateListVariable: predicateListVariable,
    rootPredicateFunction: rootPredicateFunction,
    predicates: predicates,
    listElementVariable: listElementVariable
  });
};

var buildPredicateFunction = function buildPredicateFunction(_ref45) {
  var nullFieldPredicate = _ref45.nullFieldPredicate,
      pathExistencePredicate = _ref45.pathExistencePredicate,
      predicateListVariable = _ref45.predicateListVariable,
      rootPredicateFunction = _ref45.rootPredicateFunction,
      predicates = _ref45.predicates,
      listElementVariable = _ref45.listElementVariable;
  // https://neo4j.com/docs/cypher-manual/current/functions/predicate/
  return "".concat(nullFieldPredicate || '').concat(pathExistencePredicate ? "EXISTS(".concat(pathExistencePredicate, ") AND ") : '').concat(rootPredicateFunction, "(").concat(listElementVariable, " IN ").concat(predicateListVariable, " WHERE ").concat(predicates, ")");
};

var buildRelationVariable = function buildRelationVariable(thisType, relatedType) {
  return "".concat(thisType.toLowerCase(), "_filter_").concat(relatedType.toLowerCase());
};

var decidePredicateFunction = function decidePredicateFunction(_ref46) {
  var filterOperationField = _ref46.filterOperationField,
      filterOperationType = _ref46.filterOperationType,
      isRelationTypeNode = _ref46.isRelationTypeNode,
      isRelationList = _ref46.isRelationList;
  if (filterOperationField === 'AND') return 'ALL';else if (filterOperationField === 'OR') return 'ANY';else if (isRelationTypeNode) return 'ALL';else if (isRelationList) return 'ALL';else {
    switch (filterOperationType) {
      case 'not':
        return 'NONE';

      case 'in':
        return 'ANY';

      case 'not_in':
        return 'NONE';

      case 'some':
        return 'ANY';

      case 'every':
        return 'ALL';

      case 'none':
        return 'NONE';

      case 'single':
        return 'SINGLE';

      case 'distance':
      case 'distance_lt':
      case 'distance_lte':
      case 'distance_gt':
      case 'distance_gte':
        return 'distance';

      default:
        return 'ALL';
    }
  }
};

var buildRelatedTypeListComprehension = function buildRelatedTypeListComprehension(_ref47) {
  var rootIsRelationType = _ref47.rootIsRelationType,
      variableName = _ref47.variableName,
      thisType = _ref47.thisType,
      relatedType = _ref47.relatedType,
      relationLabel = _ref47.relationLabel,
      relationDirection = _ref47.relationDirection,
      isRelationTypeNode = _ref47.isRelationTypeNode,
      isRelationType = _ref47.isRelationType;
  var relationVariable = buildRelationVariable(thisType, relatedType);

  if (rootIsRelationType) {
    relationVariable = variableName;
  }

  var thisTypeVariable = !rootIsRelationType && !isRelationTypeNode ? (0, _utils.safeVar)((0, _utils.lowFirstLetter)(variableName)) : (0, _utils.safeVar)((0, _utils.lowFirstLetter)(thisType)); // prevents related node variable from
  // conflicting with parent variables

  var relatedTypeVariable = (0, _utils.safeVar)("_".concat(relatedType.toLowerCase())); // builds a path pattern within a list comprehension
  // that extracts related nodes

  return "[(".concat(thisTypeVariable, ")").concat(relationDirection === 'IN' ? '<' : '', "-[").concat(isRelationType ? (0, _utils.safeVar)("_".concat(relationVariable)) : isRelationTypeNode ? (0, _utils.safeVar)(relationVariable) : '').concat(!isRelationTypeNode ? ":".concat(relationLabel) : '', "]-").concat(relationDirection === 'OUT' ? '>' : '', "(").concat(isRelationType ? '' : relatedTypeVariable, ":").concat(relatedType, ") | ").concat(isRelationType ? (0, _utils.safeVar)("_".concat(relationVariable)) : relatedTypeVariable, "]");
};

var buildRelationExistencePath = function buildRelationExistencePath(fromVar, relLabel, relDirection, toType, isRelationTypeNode) {
  // because ALL(n IN [] WHERE n) currently returns true
  // an existence predicate is added to make sure a relationship exists
  // otherwise a node returns when it has 0 such relationships, since the
  // predicate function then evaluates an empty list
  var safeFromVar = (0, _utils.safeVar)(fromVar);
  return !isRelationTypeNode ? "(".concat(safeFromVar, ")").concat(relDirection === 'IN' ? '<' : '', "-[:").concat(relLabel, "]-").concat(relDirection === 'OUT' ? '>' : '', "(:").concat(toType, ")") : '';
};

var buildFilterPredicates = function buildFilterPredicates(_ref48) {
  var parentSchemaType = _ref48.parentSchemaType,
      parentFieldName = _ref48.parentFieldName,
      schemaType = _ref48.schemaType,
      variableName = _ref48.variableName,
      listVariable = _ref48.listVariable,
      filterValue = _ref48.filterValue,
      filterParam = _ref48.filterParam,
      typeFields = _ref48.typeFields,
      schema = _ref48.schema,
      isListFilterArgument = _ref48.isListFilterArgument;
  return (0, _entries["default"])(filterValue).reduce(function (predicates, _ref49) {
    var _ref50 = (0, _slicedToArray2["default"])(_ref49, 2),
        name = _ref50[0],
        value = _ref50[1];

    name = deserializeFilterFieldName(name);
    var predicate = translateFilterArgument({
      field: typeFields[name],
      parentParamPath: listVariable,
      fieldName: name,
      filterValue: value,
      parentFieldName: parentFieldName,
      parentSchemaType: parentSchemaType,
      isListFilterArgument: isListFilterArgument,
      variableName: variableName,
      filterParam: filterParam,
      schemaType: schemaType,
      schema: schema
    });

    if (predicate) {
      predicates.push("(".concat(predicate, ")"));
    }

    return predicates;
  }, []).join(' AND ');
};

var translateNeo4jTypeFilter = function translateNeo4jTypeFilter(_ref51) {
  var typeName = _ref51.typeName,
      isRelationTypeNode = _ref51.isRelationTypeNode,
      filterValue = _ref51.filterValue,
      variableName = _ref51.variableName,
      filterOperationField = _ref51.filterOperationField,
      filterOperationType = _ref51.filterOperationType,
      fieldName = _ref51.fieldName,
      filterParam = _ref51.filterParam,
      fieldType = _ref51.fieldType,
      parameterPath = _ref51.parameterPath,
      parentParamPath = _ref51.parentParamPath,
      isListFilterArgument = _ref51.isListFilterArgument,
      nullFieldPredicate = _ref51.nullFieldPredicate;
  var predicate = '';

  if ((0, _utils.isTemporalInputType)(typeName) || (0, _utils.isSpatialInputType)(typeName) || (0, _utils.isSpatialDistanceInputType)(typeName)) {
    var cypherTypeConstructor = (0, _utils.decideNeo4jTypeConstructor)(typeName);
    var safeVariableName = (0, _utils.safeVar)(variableName);
    var propertyPath = "".concat(safeVariableName, ".").concat(filterOperationField);

    if (isExistentialFilter(filterOperationType, filterValue)) {
      return translateNullFilter({
        filterOperationField: filterOperationField,
        filterOperationType: filterOperationType,
        propertyPath: propertyPath,
        filterParam: filterParam,
        parentParamPath: parentParamPath,
        isListFilterArgument: isListFilterArgument
      });
    }

    var rootPredicateFunction = decidePredicateFunction({
      isRelationTypeNode: isRelationTypeNode,
      filterOperationField: filterOperationField,
      filterOperationType: filterOperationType
    });
    predicate = buildNeo4jTypePredicate({
      typeName: typeName,
      fieldName: fieldName,
      fieldType: fieldType,
      filterValue: filterValue,
      filterOperationField: filterOperationField,
      filterOperationType: filterOperationType,
      parameterPath: parameterPath,
      variableName: variableName,
      nullFieldPredicate: nullFieldPredicate,
      rootPredicateFunction: rootPredicateFunction,
      cypherTypeConstructor: cypherTypeConstructor
    });
  }

  return predicate;
};

var buildNeo4jTypePredicate = function buildNeo4jTypePredicate(_ref52) {
  var typeName = _ref52.typeName,
      fieldName = _ref52.fieldName,
      fieldType = _ref52.fieldType,
      filterOperationField = _ref52.filterOperationField,
      filterOperationType = _ref52.filterOperationType,
      parameterPath = _ref52.parameterPath,
      variableName = _ref52.variableName,
      nullFieldPredicate = _ref52.nullFieldPredicate,
      rootPredicateFunction = _ref52.rootPredicateFunction,
      cypherTypeConstructor = _ref52.cypherTypeConstructor;
  // ex: project -> person_filter_project
  var isListFilterArgument = (0, _graphql.isListType)(fieldType);
  var listVariable = parameterPath; // ex: $filter.datetime_in -> _datetime_in

  if (isListFilterArgument) listVariable = "_".concat(fieldName);
  var safeVariableName = (0, _utils.safeVar)(variableName);
  var propertyPath = "".concat(safeVariableName, ".").concat(filterOperationField);
  var operatorExpression = buildOperatorExpression({
    filterOperationType: filterOperationType,
    propertyPath: propertyPath,
    isListFilterArgument: isListFilterArgument,
    parameterPath: parameterPath
  });

  if ((0, _utils.isSpatialDistanceInputType)(typeName)) {
    listVariable = "".concat(listVariable, ".distance");
  }

  var translation = "(".concat(nullFieldPredicate).concat(operatorExpression, " ").concat(cypherTypeConstructor, "(").concat(listVariable, "))");

  if (isListFilterArgument) {
    translation = buildPredicateFunction({
      predicateListVariable: parameterPath,
      listElementVariable: listVariable,
      rootPredicateFunction: rootPredicateFunction,
      predicates: translation
    });
  }

  return translation;
};