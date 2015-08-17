var restify = require('restify');
var debug = require('debug')('dozer:auth');
var config = require('./config');

module.exports = function () {
  return function (req, res, next) {
    var isLocal = req.socket.remoteAddress === '127.0.0.1' ||
      req.socket.remoteAddress === '::';
    if (config.get('auth.allowLocal') && isLocal) {
      debug('authorization granted for local connection');
      return next();
    }
    if (req.authorization && req.authorization.basic) {
      var key = req.authorization.basic.username;
      var secret = req.authorization.basic.password
      if (config.get('auth.apiKeys.' + key) === secret) {
        debug('authorization granted for %s', key);
        return next();
      }
    }
    return next(new restify.UnauthorizedError('Unauthorized'));
  };
};
