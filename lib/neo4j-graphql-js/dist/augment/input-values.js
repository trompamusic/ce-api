"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs2/helpers/interopRequireDefault");

var _Object$defineProperty = require("@babel/runtime-corejs2/core-js/object/define-property");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.buildFilters = exports.buildQueryFilteringInputType = exports.buildPropertyOrderingValues = exports.buildQueryOrderingEnumType = exports.buildQueryFieldArguments = exports.augmentInputTypePropertyFields = exports.FilteringArgument = exports.OrderingArgument = exports.PagingArgument = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/defineProperty"));

var _values = _interopRequireDefault(require("@babel/runtime-corejs2/core-js/object/values"));

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/toConsumableArray"));

var _graphql = require("graphql");

var _ast = require("./ast");

var _types = require("./types/types");

var _directives = require("./directives");

var _fields = require("./fields");

var _spatial = require("./types/spatial");

/**
 * An enum describing the names of the input value definitions
 * used for the field argument AST for data result pagination
 */
var PagingArgument = {
  FIRST: 'first',
  OFFSET: 'offset'
};
/**
 * An enum describing the names of the input value definitions
 * used for the field argument AST for data result ordering
 */

exports.PagingArgument = PagingArgument;
var OrderingArgument = {
  ORDER_BY: 'orderBy'
};
/**
 * An enum describing the names of the input value definitions
 * used for the field argument AST for data selection filtering
 */

exports.OrderingArgument = OrderingArgument;
var FilteringArgument = {
  FILTER: 'filter'
};
/**
 * Builds the AST definitions for input values that compose the
 * input object types used by Query API field arguments,
 * e.g., pagination, ordering, filtering, etc.
 */

exports.FilteringArgument = FilteringArgument;

var augmentInputTypePropertyFields = function augmentInputTypePropertyFields(_ref) {
  var _ref$inputTypeMap = _ref.inputTypeMap,
      inputTypeMap = _ref$inputTypeMap === void 0 ? {} : _ref$inputTypeMap,
      fieldName = _ref.fieldName,
      fieldDirectives = _ref.fieldDirectives,
      outputType = _ref.outputType,
      outputKind = _ref.outputKind,
      outputTypeWrappers = _ref.outputTypeWrappers;
  var filteringType = inputTypeMap[FilteringArgument.FILTER];
  var orderingType = inputTypeMap[OrderingArgument.ORDER_BY];

  if (!(0, _fields.isListTypeField)({
    wrappers: outputTypeWrappers
  })) {
    if (!(0, _directives.isCypherField)({
      directives: fieldDirectives
    }) && !(0, _fields.isNeo4jIDField)({
      name: fieldName
    })) {
      if (filteringType) {
        var _filteringType$fields;

        (_filteringType$fields = filteringType.fields).push.apply(_filteringType$fields, (0, _toConsumableArray2["default"])(buildPropertyFilters({
          fieldName: fieldName,
          outputType: outputType,
          outputKind: outputKind
        })));
      }
    }

    if (orderingType && outputType !== _spatial.SpatialType.POINT) {
      var _orderingType$values;

      (_orderingType$values = orderingType.values).push.apply(_orderingType$values, (0, _toConsumableArray2["default"])(buildPropertyOrderingValues({
        fieldName: fieldName
      })));
    }
  }

  return inputTypeMap;
};
/**
 * Given an argumentMap of expected Query API field arguments,
 * builds their AST definitions
 */


exports.augmentInputTypePropertyFields = augmentInputTypePropertyFields;

var buildQueryFieldArguments = function buildQueryFieldArguments(_ref2) {
  var _ref2$argumentMap = _ref2.argumentMap,
      argumentMap = _ref2$argumentMap === void 0 ? {} : _ref2$argumentMap,
      fieldArguments = _ref2.fieldArguments,
      fieldDirectives = _ref2.fieldDirectives,
      outputType = _ref2.outputType,
      outputTypeWrappers = _ref2.outputTypeWrappers,
      typeDefinitionMap = _ref2.typeDefinitionMap;
  (0, _values["default"])(argumentMap).forEach(function (name) {
    if ((0, _fields.isListTypeField)({
      wrappers: outputTypeWrappers
    })) {
      if (name === PagingArgument.FIRST) {
        // Does not overwrite
        if (!(0, _fields.getFieldDefinition)({
          fields: fieldArguments,
          name: PagingArgument.FIRST
        })) {
          fieldArguments.push(buildQueryPagingArgument({
            name: PagingArgument.FIRST
          }));
        }
      } else if (name === PagingArgument.OFFSET) {
        // Does not overwrite
        if (!(0, _fields.getFieldDefinition)({
          fields: fieldArguments,
          name: PagingArgument.OFFSET
        })) {
          fieldArguments.push(buildQueryPagingArgument({
            name: PagingArgument.OFFSET
          }));
        }
      } else if (name === OrderingArgument.ORDER_BY) {
        var argumentIndex = fieldArguments.findIndex(function (arg) {
          return arg.name.value === OrderingArgument.ORDER_BY;
        });
        var outputTypeDefinition = typeDefinitionMap[outputType];
        var orderingArgument = buildQueryOrderingArgument({
          typeName: outputType
        });
        var hasPropertyField = (0, _fields.propertyFieldExists)({
          definition: outputTypeDefinition,
          typeDefinitionMap: typeDefinitionMap
        }); // Does not already exist

        if (argumentIndex === -1) {
          // Ordering is only supported when there exists at
          // least 1 property field (scalar, temporal, etc.)
          if (hasPropertyField) {
            fieldArguments.push(orderingArgument);
          }
        } else {
          // Does already exist
          if (hasPropertyField) {
            // Replace it with generated argument
            fieldArguments.splice(argumentIndex, 1, orderingArgument);
          } // Else, there are no property fields on the type to be ordered,
          // but we should keep what has been provided

        }
      }
    }

    if (name === FilteringArgument.FILTER) {
      if (!(0, _directives.isCypherField)({
        directives: fieldDirectives
      })) {
        var _argumentIndex = fieldArguments.findIndex(function (arg) {
          return arg.name.value === FilteringArgument.FILTER;
        }); // Does overwrite


        if (_argumentIndex === -1) {
          fieldArguments.push(buildQueryFilteringArgument({
            typeName: outputType
          }));
        } else {
          fieldArguments.splice(_argumentIndex, 1, buildQueryFilteringArgument({
            typeName: outputType
          }));
        }
      }
    }
  });
  return fieldArguments;
};
/**
 * Builds the AST definition for pagination field arguments
 * used in the Query API
 */


exports.buildQueryFieldArguments = buildQueryFieldArguments;

var buildQueryPagingArgument = function buildQueryPagingArgument(_ref3) {
  var _ref3$name = _ref3.name,
      name = _ref3$name === void 0 ? '' : _ref3$name;
  var arg = {}; // Prevent overwrite

  if (name === PagingArgument.FIRST) {
    arg = (0, _ast.buildInputValue)({
      name: (0, _ast.buildName)({
        name: PagingArgument.FIRST
      }),
      type: (0, _ast.buildNamedType)({
        name: _graphql.GraphQLInt.name
      })
    });
  }

  if (name === PagingArgument.OFFSET) {
    arg = (0, _ast.buildInputValue)({
      name: (0, _ast.buildName)({
        name: PagingArgument.OFFSET
      }),
      type: (0, _ast.buildNamedType)({
        name: _graphql.GraphQLInt.name
      })
    });
  }

  return arg;
};
/**
 * Builds the AST definition for ordering field arguments
 */


var buildQueryOrderingArgument = function buildQueryOrderingArgument(_ref4) {
  var typeName = _ref4.typeName;
  return (0, _ast.buildInputValue)({
    name: (0, _ast.buildName)({
      name: OrderingArgument.ORDER_BY
    }),
    type: (0, _ast.buildNamedType)({
      name: "_".concat(typeName, "Ordering"),
      wrappers: (0, _defineProperty2["default"])({}, _fields.TypeWrappers.LIST_TYPE, true)
    })
  });
};
/**
 * Builds the AST definition for an enum type used as the
 * type of an ordering field argument
 */


var buildQueryOrderingEnumType = function buildQueryOrderingEnumType(_ref5) {
  var nodeInputTypeMap = _ref5.nodeInputTypeMap,
      typeDefinitionMap = _ref5.typeDefinitionMap,
      generatedTypeMap = _ref5.generatedTypeMap;
  var inputType = nodeInputTypeMap[OrderingArgument.ORDER_BY];

  if (inputType && inputType.values.length) {
    var orderingTypeName = inputType.name;
    var type = typeDefinitionMap[inputType.name]; // Prevent overwrite

    if (!type) {
      inputType.name = (0, _ast.buildName)({
        name: orderingTypeName
      });
      generatedTypeMap[orderingTypeName] = (0, _ast.buildEnumType)(inputType);
    }
  }

  return generatedTypeMap;
};
/**
 * Builds the AST definitions for the values of an enum
 * definitions used by an ordering field argument
 */


exports.buildQueryOrderingEnumType = buildQueryOrderingEnumType;

var buildPropertyOrderingValues = function buildPropertyOrderingValues(_ref6) {
  var fieldName = _ref6.fieldName;
  return [(0, _ast.buildEnumValue)({
    name: (0, _ast.buildName)({
      name: "".concat(fieldName, "_asc")
    })
  }), (0, _ast.buildEnumValue)({
    name: (0, _ast.buildName)({
      name: "".concat(fieldName, "_desc")
    })
  })];
};
/**
 * Builds the AST definition for the input value definition
 * used for a filtering field argument
 */


exports.buildPropertyOrderingValues = buildPropertyOrderingValues;

var buildQueryFilteringArgument = function buildQueryFilteringArgument(_ref7) {
  var typeName = _ref7.typeName;
  return (0, _ast.buildInputValue)({
    name: (0, _ast.buildName)({
      name: FilteringArgument.FILTER
    }),
    type: (0, _ast.buildNamedType)({
      name: "_".concat(typeName, "Filter")
    })
  });
};
/**
 * Builds the AST definition for an input object type used
 * as the type of a filtering field argument
 */


var buildQueryFilteringInputType = function buildQueryFilteringInputType(_ref8) {
  var typeName = _ref8.typeName,
      inputTypeMap = _ref8.inputTypeMap,
      typeDefinitionMap = _ref8.typeDefinitionMap,
      generatedTypeMap = _ref8.generatedTypeMap;
  var inputType = inputTypeMap[FilteringArgument.FILTER];

  if (inputType) {
    var _inputType$fields;

    var inputTypeName = inputType.name;
    inputType.name = (0, _ast.buildName)({
      name: inputTypeName
    });

    (_inputType$fields = inputType.fields).unshift.apply(_inputType$fields, (0, _toConsumableArray2["default"])(buildLogicalFilterInputValues({
      typeName: typeName
    })));

    if (!typeDefinitionMap[inputTypeName]) {
      generatedTypeMap[inputTypeName] = (0, _ast.buildInputObjectType)(inputType);
    }
  }

  return generatedTypeMap;
}; // An enum containing the semantics of logical filtering arguments


exports.buildQueryFilteringInputType = buildQueryFilteringInputType;
var LogicalFilteringArgument = {
  AND: 'AND',
  OR: 'OR'
};
/**
 * Builds the AST definitions for logical filtering arguments
 */

var buildLogicalFilterInputValues = function buildLogicalFilterInputValues(_ref9) {
  var _wrappers2, _wrappers3;

  var _ref9$typeName = _ref9.typeName,
      typeName = _ref9$typeName === void 0 ? '' : _ref9$typeName;
  return [(0, _ast.buildInputValue)({
    name: (0, _ast.buildName)({
      name: LogicalFilteringArgument.AND
    }),
    type: (0, _ast.buildNamedType)({
      name: typeName,
      wrappers: (_wrappers2 = {}, (0, _defineProperty2["default"])(_wrappers2, _fields.TypeWrappers.NON_NULL_NAMED_TYPE, true), (0, _defineProperty2["default"])(_wrappers2, _fields.TypeWrappers.LIST_TYPE, true), _wrappers2)
    })
  }), (0, _ast.buildInputValue)({
    name: (0, _ast.buildName)({
      name: LogicalFilteringArgument.OR
    }),
    type: (0, _ast.buildNamedType)({
      name: typeName,
      wrappers: (_wrappers3 = {}, (0, _defineProperty2["default"])(_wrappers3, _fields.TypeWrappers.NON_NULL_NAMED_TYPE, true), (0, _defineProperty2["default"])(_wrappers3, _fields.TypeWrappers.LIST_TYPE, true), _wrappers3)
    })
  })];
};
/**
 * Builds the AST definitions for filtering Neo4j property type fields
 */


var buildPropertyFilters = function buildPropertyFilters(_ref10) {
  var _ref10$fieldName = _ref10.fieldName,
      fieldName = _ref10$fieldName === void 0 ? '' : _ref10$fieldName,
      _ref10$outputType = _ref10.outputType,
      outputType = _ref10$outputType === void 0 ? '' : _ref10$outputType,
      _ref10$outputKind = _ref10.outputKind,
      outputKind = _ref10$outputKind === void 0 ? '' : _ref10$outputKind;
  var filters = [];

  if ((0, _fields.isSpatialField)({
    type: outputType
  }) || (0, _types.isNeo4jPointType)({
    type: outputType
  })) {
    filters = buildFilters({
      fieldName: fieldName,
      fieldConfig: {
        name: fieldName,
        type: {
          name: outputType
        }
      },
      filterTypes: ['not'].concat((0, _toConsumableArray2["default"])((0, _values["default"])(_spatial.Neo4jPointDistanceFilter)))
    });
  } else if ((0, _fields.isIntegerField)({
    type: outputType
  }) || (0, _fields.isFloatField)({
    type: outputType
  }) || (0, _fields.isTemporalField)({
    type: outputType
  }) || (0, _types.isNeo4jTemporalType)({
    type: outputType
  })) {
    filters = buildFilters({
      fieldName: fieldName,
      fieldConfig: {
        name: fieldName,
        type: {
          name: outputType
        }
      },
      filterTypes: ['not', 'in', 'not_in', 'lt', 'lte', 'gt', 'gte']
    });
  } else if ((0, _fields.isBooleanField)({
    type: outputType
  })) {
    filters = buildFilters({
      fieldName: fieldName,
      fieldConfig: {
        name: fieldName,
        type: {
          name: outputType
        }
      },
      filterTypes: ['not']
    });
  } else if ((0, _fields.isStringField)({
    kind: outputKind,
    type: outputType
  })) {
    if (outputKind === _graphql.Kind.ENUM_TYPE_DEFINITION) {
      filters = buildFilters({
        fieldName: fieldName,
        fieldConfig: {
          name: fieldName,
          type: {
            name: outputType
          }
        },
        filterTypes: ['not', 'in', 'not_in']
      });
    } else {
      filters = buildFilters({
        fieldName: fieldName,
        fieldConfig: {
          name: fieldName,
          type: {
            name: outputType
          }
        },
        filterTypes: ['not', 'in', 'not_in', 'contains', 'not_contains', 'starts_with', 'not_starts_with', 'ends_with', 'not_ends_with']
      });
    }
  }

  return filters;
};
/**
 * Builds the input value definitions that compose input object types
 * used by filtering arguments
 */


var buildFilters = function buildFilters(_ref11) {
  var fieldName = _ref11.fieldName,
      fieldConfig = _ref11.fieldConfig,
      _ref11$filterTypes = _ref11.filterTypes,
      filterTypes = _ref11$filterTypes === void 0 ? [] : _ref11$filterTypes;
  return filterTypes.reduce(function (inputValues, name) {
    var filterName = "".concat(fieldName, "_").concat(name);
    var isPointDistanceFilter = (0, _values["default"])(_spatial.Neo4jPointDistanceFilter).some(function (distanceFilter) {
      return distanceFilter === name;
    });
    var isListFilter = name === 'in' || name === 'not_in';
    var wrappers = {};

    if (isListFilter) {
      var _wrappers4;

      wrappers = (_wrappers4 = {}, (0, _defineProperty2["default"])(_wrappers4, _fields.TypeWrappers.NON_NULL_NAMED_TYPE, true), (0, _defineProperty2["default"])(_wrappers4, _fields.TypeWrappers.LIST_TYPE, true), _wrappers4);
    } else if (isPointDistanceFilter) {
      fieldConfig.type.name = "".concat(_types.Neo4jTypeName).concat(_spatial.SpatialType.POINT, "DistanceFilter");
    }

    inputValues.push((0, _ast.buildInputValue)({
      name: (0, _ast.buildName)({
        name: filterName
      }),
      type: (0, _ast.buildNamedType)({
        name: fieldConfig.type.name,
        wrappers: wrappers
      })
    }));
    return inputValues;
  }, [(0, _ast.buildInputValue)({
    name: (0, _ast.buildName)({
      name: fieldConfig.name
    }),
    type: (0, _ast.buildNamedType)(fieldConfig.type)
  })]);
};

exports.buildFilters = buildFilters;