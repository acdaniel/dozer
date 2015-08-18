var restify = require('restify');
var debug = require('debug')('dozer:client');
var url = require('url');
var qs = require('querystring');
var assign = require('object-assign');
var q = require('q');
var package = require('../package.json');

function createJsonClient (uriParts, options) {
  debug('building client options');
  var o = assign(
    {
      auth: process.env.DOZER_API_KEY + ':' + process.env.DOZER_API_SECRET,
      rejectUnauthorized: process.env.DOZER_REJECT_UNAUTH &&
        (!process.env.DOZER_REJECT_UNAUTH === 'false' && !process.env.DOZER_REJECT_UNAUTH === '0')
    },
    options,
    {
      url: url.format({
        protocol: uriParts.protocol || 'http',
        slashes: uriParts.slashes || '://',
        host: uriParts.host || 'localhost:27080'
      }),
      accept: 'application/json',
      userAgent: 'dozer/' + package.version
    }
  );
  debug('instantiating client');
  var jsonClient = restify.createJsonClient(o);
  if (options.auth) {
    debug('setting client auth');
    var auth = options.auth.split(':');
    jsonClient.basicAuth(auth[0], auth[1]);
  }
  return jsonClient;
}

var client = {

  get: function (uri, options) {
    if (process.env.DOZER_BASE_URI) {
      uri = process.env.DOZER_BASE_URI + uri;
    }
    var deferred = q.defer();
    debug('parsing uri');
    var uriParts = url.parse(uri, true);
    debug('creating json client');
    var jsonClient = createJsonClient(uriParts, options);
    var params = {
      q: options.query,
      f: options.fields,
      l: options.limit,
      i: options.skip,
      s: options.sort,
      c: options.count,
      o: options.one
    };
    debug('stringifing params');
    var qstr = qs.stringify(params);
    debug('performing request GET %s', uriParts.pathname + '?' + qstr);
    jsonClient.get(uriParts.pathname + '?' + qstr, function (err, req, res, obj) {
      if (err) { return deferred.reject(err); }
      debug('returning results');
      return deferred.resolve(obj);
    });
    return deferred.promise;
  },

  post: function (uri, docs, options) {
    if (process.env.DOZER_BASE_URI) {
      uri = process.env.DOZER_BASE_URI + uri;
    }
    var deferred = q.defer();
    debug('parsing uri');
    var uriParts = url.parse(uri, true);
    debug('creating json client');
    var jsonClient = createJsonClient(uriParts, options);
    debug('performing request POST %s', uriParts.pathname);
    jsonClient.post(uriParts.pathname, docs, function (err, req, res, obj) {
      if (err) { return deferred.reject(err); }
      debug('returning results');
      return deferred.resolve(obj);
    });
    return deferred.promise;
  },

  put: function (uri, body, options) {
    if (process.env.DOZER_BASE_URI) {
      uri = process.env.DOZER_BASE_URI + uri;
    }
    var deferred = q.defer();
    debug('parsing uri');
    var uriParts = url.parse(uri, true);
    debug('creating json client');
    var jsonClient = createJsonClient(uriParts, options);
    var params = {
      q: options.query,
      m: options.multiple,
      u: options.upsert
    };
    debug('stringifing params');
    var qstr = qs.stringify(params);
    debug('performing request PUT %s', uriParts.pathname + '?' + qstr);
    jsonClient.put(uriParts.pathname + '?' + qstr, body, function (err, req, res, obj) {
      if (err) { return deferred.reject(err); }
      debug('returning results');
      return deferred.resolve(obj);
    });
    return deferred.promise;
  },

  del: function (uri, options) {
    if (process.env.DOZER_BASE_URI) {
      uri = process.env.DOZER_BASE_URI + uri;
    }
    var deferred = q.defer();
    debug('parsing uri');
    var uriParts = url.parse(uri, true);
    debug('creating json client');
    var jsonClient = createJsonClient(uriParts, options);
    var params = {
      q: options.query,
      m: options.multiple
    };
    debug('stringifing params');
    var qstr = qs.stringify(params);
    debug('performing request DELETE %s', uriParts.pathname + '?' + qstr);
    jsonClient.del(uriParts.pathname + '?' + qstr, function (err, req, res, obj) {
      if (err) { return deferred.reject(err); }
      debug('returning results');
      return deferred.resolve(obj);
    });
    return deferred.promise;
  }

};

client.find = client.get;
client.insert = client.post;
client.update = client.put;

module.exports = client;
