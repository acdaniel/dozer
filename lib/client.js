var restify = require('restify');
var debug = require('debug')('dozer:client');
var url = require('url');
var qs = require('querystring');
var assign = require('object-assign');
var q = require('q');

function createJsonClient (uriParts, options) {
  var jsonClient = restify.createJsonClient({
    url: url.format({
      protocol: uriParts.protocol || 'http',
      slashes: uriParts.slashes || '://',
      host: uriParts.host || 'localhost:27080'
    }),
    accept: 'application/json'
  });
  if (options.auth) {
    var auth = options.auth.split(':');
    jsonClient.basicAuth(auth[0], auth[1]);
  }
  return jsonClient;
}

var client = {

  get: function (uri, options) {
    var deferred = q.defer();
    var uriParts = url.parse(uri, true);
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
    var qstr = qs.stringify(params);
    jsonClient.get(uriParts.pathname + '?' + qstr, function (err, req, res, obj) {
      if (err) { return deferred.reject(err); }
      return deferred.resolve(obj);
    });
    return deferred.promise;
  },

  post: function (uri, docs, options) {
    var deferred = q.defer();
    var uriParts = url.parse(uri, true);
    var jsonClient = createJsonClient(uriParts, options);
    jsonClient.post(uriParts.pathname, docs, function (err, req, res, obj) {
      if (err) { return deferred.reject(err); }
      return deferred.resolve(obj);
    });
    return deferred.promise;
  },

  put: function (uri, body, options) {
    var deferred = q.defer();
    var uriParts = url.parse(uri, true);
    var jsonClient = createJsonClient(uriParts, options);
    var params = {
      q: options.query,
      m: options.multiple,
      u: options.upsert
    };
    var qstr = qs.stringify(params);
    jsonClient.put(uriParts.pathname + '?' + qstr, body, function (err, req, res, obj) {
      if (err) { return deferred.reject(err); }
      return deferred.resolve(obj);
    });
    return deferred.promise;
  },

  del: function (uri, options) {
    var deferred = q.defer();
    var uriParts = url.parse(uri, true);
    var jsonClient = createJsonClient(uriParts, options);
    var params = {
      q: options.query,
      m: options.multiple
    };
    var qstr = qs.stringify(params);
    jsonClient.del(uriParts.pathname + '?' + qstr, function (err, req, res, obj) {
      if (err) { return deferred.reject(err); }
      return deferred.resolve(obj);
    });
    return deferred.promise;
  }

};

client.find = client.get;
client.insert = client.post;
client.update = client.put;

module.exports = client;
