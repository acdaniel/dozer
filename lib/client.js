var restify = require('restify');
var debug = require('debug')('dozer:client');
var url = require('url');
var qs = require('querystring');
var assign = require('object-assign');
var q = require('q');
var ms = require('ms');
var EJSON = require('mongodb-extended-json');
var package = require('../package.json');

function createJsonClient (uriParts, options) {
  debug('building client options');
  if (!options.token && process.env.DOZER_TOKEN) {
    options.token = process.env.DOZER_TOKEN;
  }
  if ('undefined' === typeof options.rejectUnauthorized && process.env.DOZER_REJECT_UNAUTH) {
    options.rejectUnauthorized = !process.env.DOZER_REJECT_UNAUTH === 'false' && !process.env.DOZER_REJECT_UNAUTH === '0';
  }
  assign(
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
  if (options.token) {
    options.headers = options.headers || {};
    options.headers['authorization'] = 'BEARER ' + options.token;
  }
  debug('instantiating client');
  var jsonClient = restify.createJsonClient(options);
  return jsonClient;
}

function execTime (startTime) {
  var diff = process.hrtime(startTime);
  return ms((diff[0] * 1e9 + diff[1]) / 1e6);
};

var client = {

  get: function (uri, options) {
    var startTime = process.hrtime();
    options = assign({ deflate: true }, options);
    if (process.env.DOZER_BASE_URI) {
      uri = process.env.DOZER_BASE_URI + uri;
    }
    var deferred = q.defer();
    debug('parsing uri');
    var uriParts = url.parse(uri, true);
    debug('creating json client');
    var jsonClient = createJsonClient(uriParts, options);
    var params = {};
    if ('undefined' !== typeof options.query) {
      params.q = 'string' === typeof options.query ? options.query : EJSON.stringify(options.query);
    }
    if ('undefined' !== typeof options.fields) {
      params.f = 'string' === typeof options.fields ? options.fields : EJSON.stringify(options.fields);
    }
    if ('undefined' !== typeof options.limit) {
      params.l = options.limit;
    }
    if ('undefined' !== typeof options.skip) {
      params.i = options.skip;
    }
    if ('undefined' !== typeof options.sort) {
      params.s = 'string' === typeof options.sort ? options.sort : EJSON.stringify(options.sort);
    }
    if ('undefined' !== typeof options.count) {
      params.c = options.count;
    }
    if ('undefined' !== typeof options.one) {
      params.o = options.one;
    }
    debug('stringifing params');
    var qstr = qs.stringify(params);
    debug('performing request GET %s', uriParts.pathname + (qstr ? '?' + qstr : ''));
    jsonClient.get(uriParts.pathname + (qstr ? '?' + qstr : ''), function (err, req, res, obj) {
      if (err) {
        debug('ERROR %j', err);
        return deferred.reject(err);
      }
      debug('returning results');
      debug('total execution time: %s', execTime(startTime));
      return deferred.resolve(!options.deflate ? obj : EJSON.deflate(obj));
    });
    return deferred.promise;
  },

  post: function (uri, body, options) {
    var startTime = process.hrtime();
    options = assign({ deflate: true }, options);
    if (process.env.DOZER_BASE_URI) {
      uri = process.env.DOZER_BASE_URI + uri;
    }
    var deferred = q.defer();
    debug('parsing uri');
    var uriParts = url.parse(uri, true);
    debug('creating json client');
    var jsonClient = createJsonClient(uriParts, options);
    debug('performing request POST %s', uriParts.pathname);
    body = 'string' === typeof body ? EJSON.parse(body) : EJSON.inflate(body);
    jsonClient.post(uriParts.pathname, body, function (err, req, res, obj) {
      if (err) {
        debug('ERROR %j', err);
        return deferred.reject(err);
      }
      debug('returning results');
      debug('total execution time: %s', execTime(startTime));
      return deferred.resolve(!options.deflate ? obj : EJSON.deflate(obj));
    });
    return deferred.promise;
  },

  put: function (uri, body, options) {
    var startTime = process.hrtime();
    options = assign({ deflate: true }, options);
    if (process.env.DOZER_BASE_URI) {
      uri = process.env.DOZER_BASE_URI + uri;
    }
    var deferred = q.defer();
    debug('parsing uri');
    var uriParts = url.parse(uri, true);
    debug('creating json client');
    var jsonClient = createJsonClient(uriParts, options);
    var params = {};
    if ('undefined' !== typeof options.query) {
      params.q = 'string' === typeof options.query ? options.query : EJSON.stringify(options.query);
    }
    if ('undefined' !== typeof options.multiple) {
      params.m = options.multiple;
    }
    if ('undefined' !== typeof options.upsert) {
      params.u = options.upsert;
    }
    debug('stringifing params');
    var qstr = qs.stringify(params);
    debug('performing request PUT %s', uriParts.pathname + (qstr ? '?' + qstr : ''));
    body = 'string' === typeof body ? EJSON.parse(body) : EJSON.inflate(body);
    jsonClient.put(uriParts.pathname + (qstr ? '?' + qstr : ''), body, function (err, req, res, obj) {
      if (err) {
        debug('ERROR %j', err);
        return deferred.reject(err);
      }
      debug('returning results');
      debug('total execution time: %s', execTime(startTime));
      return deferred.resolve(!options.deflate ? obj : EJSON.deflate(obj));
    });
    return deferred.promise;
  },

  del: function (uri, options) {
    var startTime = process.hrtime();
    options = assign({ deflate: true }, options);
    if (process.env.DOZER_BASE_URI) {
      uri = process.env.DOZER_BASE_URI + uri;
    }
    var deferred = q.defer();
    debug('parsing uri');
    var uriParts = url.parse(uri, true);
    debug('creating json client');
    var jsonClient = createJsonClient(uriParts, options);
    var params = {};
    if ('undefined' !== typeof options.query) {
      params.q = 'string' === typeof options.query ? options.query : EJSON.stringify(options.query);
    }
    if ('undefined' !== typeof options.multiple) {
      params.m = options.multiple;
    }
    debug('stringifing params');
    var qstr = qs.stringify(params);
    debug('performing request DELETE %s', uriParts.pathname + (qstr ? '?' + qstr : ''));
    jsonClient.del(uriParts.pathname + (qstr ? '?' + qstr : ''), function (err, req, res, obj) {
      if (err) {
        debug('ERROR %j', err);
        return deferred.reject(err);
      }
      debug('returning results');
      debug('total execution time: %s', execTime(startTime));
      return deferred.resolve(!options.deflate ? obj : EJSON.deflate(obj));
    });
    return deferred.promise;
  }

};

client.find = client.get;
client.insert = client.post;
client.update = client.put;

module.exports = client;
