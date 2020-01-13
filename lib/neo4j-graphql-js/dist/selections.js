"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs2/helpers/interopRequireDefault");

var _Object$defineProperty2 = require("@babel/runtime-corejs2/core-js/object/define-property");

_Object$defineProperty2(exports, "__esModule", {
  value: true
});

exports.buildCypherSelection = buildCypherSelection;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/define-property"));

var _defineProperties = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/define-properties"));

var _getOwnPropertyDescriptors = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/get-own-property-descriptors"));

var _getOwnPropertyDescriptor = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/get-own-property-descriptor"));

var _getOwnPropertySymbols = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/get-own-property-symbols"));

var _defineProperty3 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/defineProperty"));

var _keys = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/keys"));

var _toArray2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/toArray"));

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/slicedToArray"));

var _entries = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/entries"));

var _utils = require("./utils");

var _translate = require("./translate");

function ownKeys(object, enumerableOnly) { var keys = (0, _keys["default"])(object); if (_getOwnPropertySymbols["default"]) { var symbols = (0, _getOwnPropertySymbols["default"])(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return (0, _getOwnPropertyDescriptor["default"])(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { (0, _defineProperty3["default"])(target, key, source[key]); }); } else if (_getOwnPropertyDescriptors["default"]) { (0, _defineProperties["default"])(target, (0, _getOwnPropertyDescriptors["default"])(source)); } else { ownKeys(Object(source)).forEach(function (key) { (0, _defineProperty2["default"])(target, key, (0, _getOwnPropertyDescriptor["default"])(source, key)); }); } } return target; }

function buildCypherSelection(_ref) {
  var _ref$initial = _ref.initial,
      initial = _ref$initial === void 0 ? '' : _ref$initial,
      cypherParams = _ref.cypherParams,
      selections = _ref.selections,
      variableName = _ref.variableName,
      schemaType = _ref.schemaType,
      resolveInfo = _ref.resolveInfo,
      _ref$paramIndex = _ref.paramIndex,
      paramIndex = _ref$paramIndex === void 0 ? 1 : _ref$paramIndex,
      _ref$parentSelectionI = _ref.parentSelectionInfo,
      parentSelectionInfo = _ref$parentSelectionI === void 0 ? {} : _ref$parentSelectionI,
      _ref$secondParentSele = _ref.secondParentSelectionInfo,
      secondParentSelectionInfo = _ref$secondParentSele === void 0 ? {} : _ref$secondParentSele;
  if (!selections.length) return [initial, {}];
  selections = (0, _utils.removeIgnoredFields)(schemaType, selections);
  var selectionFilters = (0, _utils.filtersFromSelections)(selections, resolveInfo.variableValues);
  var filterParams = (0, _utils.getFilterParams)(selectionFilters, paramIndex);
  var shallowFilterParams = (0, _entries["default"])(filterParams).reduce(function (result, _ref2) {
    var _ref3 = (0, _slicedToArray2["default"])(_ref2, 2),
        key = _ref3[0],
        value = _ref3[1];

    result["".concat(value.index, "_").concat(key)] = value.value;
    return result;
  }, {});

  var _selections = selections,
      _selections2 = (0, _toArray2["default"])(_selections),
      headSelection = _selections2[0],
      tailSelections = _selections2.slice(1);

  var tailParams = {
    selections: tailSelections,
    cypherParams: cypherParams,
    variableName: variableName,
    paramIndex: paramIndex,
    schemaType: schemaType,
    resolveInfo: resolveInfo,
    parentSelectionInfo: parentSelectionInfo,
    secondParentSelectionInfo: secondParentSelectionInfo
  };

  var recurse = function recurse(args) {
    paramIndex = (0, _keys["default"])(shallowFilterParams).length > 0 ? paramIndex + 1 : paramIndex;

    var _buildCypherSelection = buildCypherSelection(_objectSpread({}, args, {}, {
      paramIndex: paramIndex
    })),
        _buildCypherSelection2 = (0, _slicedToArray2["default"])(_buildCypherSelection, 2),
        subSelection = _buildCypherSelection2[0],
        subFilterParams = _buildCypherSelection2[1];

    var derivedTypesParams = (0, _entries["default"])(args).filter(function (_ref4) {
      var _ref5 = (0, _slicedToArray2["default"])(_ref4, 1),
          key = _ref5[0];

      return key.endsWith('_derivedTypes');
    }).reduce(function (acc, _ref6) {
      var _ref7 = (0, _slicedToArray2["default"])(_ref6, 2),
          key = _ref7[0],
          value = _ref7[1];

      return _objectSpread({}, acc, (0, _defineProperty3["default"])({}, key, value));
    }, {});
    return [subSelection, _objectSpread({}, shallowFilterParams, {}, subFilterParams, {}, derivedTypesParams)];
  };

  if (selections.find(function (_ref8) {
    var kind = _ref8.kind;
    return kind && kind === 'InlineFragment';
  })) {
    return selections.filter(function (_ref9) {
      var kind = _ref9.kind;
      return kind && kind === 'InlineFragment';
    }).reduce(function (query, selection, index) {
      var fragmentSelections = selections.filter(function (_ref10) {
        var kind = _ref10.kind;
        return kind && kind !== 'InlineFragment';
      }).concat(selection.selectionSet.selections);
      var fragmentSchemaType = resolveInfo.schema.getType(selection.typeCondition.name.value);
      var fragmentTailParams = {
        selections: fragmentSelections,
        variableName: variableName,
        schemaType: fragmentSchemaType,
        resolveInfo: resolveInfo,
        parentSelectionInfo: parentSelectionInfo,
        secondParentSelectionInfo: secondParentSelectionInfo
      };
      var result = recurse(_objectSpread({
        initial: index === 0 ? query[0] : query[0] + ','
      }, fragmentTailParams));
      return result;
    }, initial || ['']);
  }

  var fieldName = headSelection.name.value;
  var commaIfTail = tailSelections.length > 0 ? ',' : '';
  var isScalarSchemaType = (0, _utils.isGraphqlScalarType)(schemaType);
  var schemaTypeField = !isScalarSchemaType ? schemaType.getFields()[fieldName] : {}; // Schema meta fields(__schema, __typename, etc)

  if (!isScalarSchemaType && !schemaTypeField) {
    return recurse(_objectSpread({
      initial: tailSelections.length ? initial : initial.substring(0, initial.lastIndexOf(','))
    }, tailParams));
  }

  var fieldType = schemaTypeField && schemaTypeField.type ? schemaTypeField.type : {};
  var innerSchemaType = (0, _utils.innerType)(fieldType); // for target "type" aka label

  var isInlineFragment = innerSchemaType && innerSchemaType.astNode && innerSchemaType.astNode.kind === 'InterfaceTypeDefinition';

  var _cypherDirective = (0, _utils.cypherDirective)(schemaType, fieldName),
      customCypher = _cypherDirective.statement;

  var typeMap = resolveInfo.schema.getTypeMap();
  var schemaTypeAstNode = typeMap[schemaType].astNode; // Database meta fields(_id)

  if (fieldName === '_id') {
    return recurse(_objectSpread({
      initial: "".concat(initial).concat(fieldName, ": ID(").concat((0, _utils.safeVar)(variableName), ")").concat(commaIfTail)
    }, tailParams));
  } // Main control flow


  if ((0, _utils.isGraphqlScalarType)(innerSchemaType)) {
    if (customCypher) {
      if ((0, _utils.getRelationTypeDirective)(schemaTypeAstNode)) {
        variableName = "".concat(variableName, "_relation");
      }

      return recurse(_objectSpread({
        initial: "".concat(initial).concat(fieldName, ": apoc.cypher.runFirstColumn(\"").concat(customCypher, "\", {").concat((0, _utils.cypherDirectiveArgs)(variableName, headSelection, cypherParams, schemaType, resolveInfo, paramIndex), "}, false)").concat(commaIfTail)
      }, tailParams));
    } else if ((0, _utils.isNeo4jTypeField)(schemaType, fieldName)) {
      return recurse((0, _translate.neo4jTypeField)({
        initial: initial,
        fieldName: fieldName,
        variableName: variableName,
        commaIfTail: commaIfTail,
        tailParams: tailParams,
        parentSelectionInfo: parentSelectionInfo,
        secondParentSelectionInfo: secondParentSelectionInfo
      }));
    } // graphql scalar type, no custom cypher statement


    return recurse(_objectSpread({
      initial: "".concat(initial, " .").concat(fieldName, " ").concat(commaIfTail)
    }, tailParams));
  } // We have a graphql object type


  var innerSchemaTypeAstNode = innerSchemaType && typeMap[innerSchemaType] ? typeMap[innerSchemaType].astNode : {};
  var innerSchemaTypeRelation = (0, _utils.getRelationTypeDirective)(innerSchemaTypeAstNode);
  var schemaTypeRelation = (0, _utils.getRelationTypeDirective)(schemaTypeAstNode);

  var _relationDirective = (0, _utils.relationDirective)(schemaType, fieldName),
      relType = _relationDirective.name,
      relDirection = _relationDirective.direction;

  var nestedVariable = (0, _utils.decideNestedVariableName)({
    schemaTypeRelation: schemaTypeRelation,
    innerSchemaTypeRelation: innerSchemaTypeRelation,
    variableName: variableName,
    fieldName: fieldName,
    parentSelectionInfo: parentSelectionInfo
  });
  var skipLimit = (0, _utils.computeSkipLimit)(headSelection, resolveInfo.variableValues);
  var subSelections = (0, _utils.extractSelections)(headSelection.selectionSet ? headSelection.selectionSet.selections : [], resolveInfo.fragments);
  var subSelection = recurse({
    initial: '',
    selections: subSelections,
    variableName: nestedVariable,
    schemaType: innerSchemaType,
    resolveInfo: resolveInfo,
    cypherParams: cypherParams,
    parentSelectionInfo: {
      fieldName: fieldName,
      schemaType: schemaType,
      variableName: variableName,
      fieldType: fieldType,
      filterParams: filterParams,
      selections: selections,
      paramIndex: paramIndex
    },
    secondParentSelectionInfo: parentSelectionInfo
  });
  var selection;
  var fieldArgs = !isScalarSchemaType && schemaTypeField && schemaTypeField.args ? schemaTypeField.args.map(function (e) {
    return e.astNode;
  }) : [];
  var neo4jTypeArgs = (0, _utils.getNeo4jTypeArguments)(fieldArgs);
  var queryParams = (0, _utils.paramsToString)((0, _utils.innerFilterParams)(filterParams, neo4jTypeArgs));
  var fieldInfo = {
    initial: initial,
    fieldName: fieldName,
    fieldType: fieldType,
    variableName: variableName,
    nestedVariable: nestedVariable,
    queryParams: queryParams,
    filterParams: filterParams,
    neo4jTypeArgs: neo4jTypeArgs,
    subSelection: subSelection,
    skipLimit: skipLimit,
    commaIfTail: commaIfTail,
    tailParams: tailParams
  };

  if (customCypher) {
    // Object type field with cypher directive
    selection = recurse((0, _translate.customCypherField)(_objectSpread({}, fieldInfo, {
      cypherParams: cypherParams,
      paramIndex: paramIndex,
      schemaType: schemaType,
      schemaTypeRelation: schemaTypeRelation,
      customCypher: customCypher,
      headSelection: headSelection,
      resolveInfo: resolveInfo
    })));
  } else if ((0, _utils.isNeo4jType)(innerSchemaType.name)) {
    selection = recurse((0, _translate.neo4jType)(_objectSpread({
      schemaType: schemaType,
      schemaTypeRelation: schemaTypeRelation,
      parentSelectionInfo: parentSelectionInfo
    }, fieldInfo)));
  } else if (relType && relDirection) {
    // Object type field with relation directive
    var neo4jTypeClauses = (0, _utils.neo4jTypePredicateClauses)(filterParams, nestedVariable, neo4jTypeArgs); // translate field, arguments and argument params

    var translation = (0, _translate.relationFieldOnNodeType)(_objectSpread({}, fieldInfo, {
      schemaType: schemaType,
      selections: selections,
      selectionFilters: selectionFilters,
      relDirection: relDirection,
      relType: relType,
      isInlineFragment: isInlineFragment,
      innerSchemaType: innerSchemaType,
      neo4jTypeClauses: neo4jTypeClauses,
      resolveInfo: resolveInfo,
      paramIndex: paramIndex,
      fieldArgs: fieldArgs,
      cypherParams: cypherParams
    }));
    selection = recurse(translation.selection); // set subSelection to update field argument params

    subSelection = translation.subSelection;
  } else if (schemaTypeRelation) {
    // Object type field on relation type
    // (from, to, renamed, relation mutation payloads...)
    var _translation = (0, _translate.nodeTypeFieldOnRelationType)({
      fieldInfo: fieldInfo,
      schemaTypeRelation: schemaTypeRelation,
      innerSchemaType: innerSchemaType,
      isInlineFragment: isInlineFragment,
      paramIndex: paramIndex,
      schemaType: schemaType,
      filterParams: filterParams,
      neo4jTypeArgs: neo4jTypeArgs,
      parentSelectionInfo: parentSelectionInfo,
      resolveInfo: resolveInfo,
      selectionFilters: selectionFilters,
      fieldArgs: fieldArgs,
      cypherParams: cypherParams
    });

    selection = recurse(_translation.selection); // set subSelection to update field argument params

    subSelection = _translation.subSelection;
  } else if (innerSchemaTypeRelation) {
    // Relation type field on node type (field payload types...)
    var _translation2 = (0, _translate.relationTypeFieldOnNodeType)(_objectSpread({}, fieldInfo, {
      innerSchemaTypeRelation: innerSchemaTypeRelation,
      schemaType: schemaType,
      innerSchemaType: innerSchemaType,
      filterParams: filterParams,
      neo4jTypeArgs: neo4jTypeArgs,
      resolveInfo: resolveInfo,
      selectionFilters: selectionFilters,
      paramIndex: paramIndex,
      fieldArgs: fieldArgs,
      cypherParams: cypherParams
    }));

    selection = recurse(_translation2.selection); // set subSelection to update field argument params

    subSelection = _translation2.subSelection;
  }

  return [selection[0], _objectSpread({}, selection[1], {}, subSelection[1])];
}