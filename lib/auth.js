var restify = require('restify');
var debug = require('debug')('dozer:auth');
var minimatch = require('minimatch');
var config = require('./config');

module.exports = function (scope) {
  return function (req, res, next) {
    if (!config.get('auth.enabled')) {
      return next();
    }
    var currentScope = 'string' === typeof scope ? scope : scope(req);
    req.auth.scope.forEach(function (item) {
      if (minimatch(currentScope, item)) {
        return next();
      }
    });
    return next(new restify.ForbiddenError('Forbidden'));
  };
};
