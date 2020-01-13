"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs2/helpers/interopRequireDefault");

var _Object$defineProperty = require("@babel/runtime-corejs2/core-js/object/define-property");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.addAuthDirectiveImplementations = exports.checkRequestError = void 0;

var _typeof2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/typeof"));

var _graphqlAuthDirectives = require("graphql-auth-directives");

// Initial support for checking auth

/*
 *  Check is context.req.error or context.error
 *  have been defined.
 */
var checkRequestError = function checkRequestError(context) {
  if (context && context.req && context.req.error) {
    return context.req.error;
  } else if (context && context.error) {
    return context.error;
  } else {
    return false;
  }
};

exports.checkRequestError = checkRequestError;

var shouldAddAuthDirective = function shouldAddAuthDirective(config, authDirective) {
  if (config && (0, _typeof2["default"])(config) === 'object') {
    return config.auth === true || config && (0, _typeof2["default"])(config.auth) === 'object' && config.auth[authDirective] === true;
  }

  return false;
};

var addAuthDirectiveImplementations = function addAuthDirectiveImplementations(schemaDirectives, typeMap, config) {
  if (shouldAddAuthDirective(config, 'isAuthenticated')) {
    schemaDirectives['isAuthenticated'] = _graphqlAuthDirectives.IsAuthenticatedDirective;
  }

  if (shouldAddAuthDirective(config, 'hasRole')) {
    getRoleType(typeMap); // ensure Role enum specified in typedefs

    schemaDirectives['hasRole'] = _graphqlAuthDirectives.HasRoleDirective;
  }

  if (shouldAddAuthDirective(config, 'hasScope')) {
    schemaDirectives['hasScope'] = _graphqlAuthDirectives.HasScopeDirective;
  }

  return schemaDirectives;
};

exports.addAuthDirectiveImplementations = addAuthDirectiveImplementations;

var getRoleType = function getRoleType(typeMap) {
  var roleType = typeMap['Role'];

  if (!roleType) {
    throw new Error("A Role enum type is required for the @hasRole auth directive.");
  }

  return roleType;
};