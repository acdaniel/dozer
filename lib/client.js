var restify = require('restify-clients');
var debug = require('debug')('dozer:client');
var url = require('url');
var qs = require('querystring');
var assign = require('object-assign');
var defaults = require('defaults');
var q = require('q');
var ms = require('ms');
var EJSON = require('mongodb-extended-json');
var defined = require('defined');
var package = require('../package.json');

function toBool (value) {
  return value === true || value === 'true' || value === '1' || value === 'yes' ?
    true : false;
}

function createJsonClient (uriParts, options) {
  debug('building client options');
  options.token = defined(options.token, process.env.DOZER_TOKEN);
  options.rejectUnauthorized = toBool(defined(options.rejectUnauthorized, process.env.DOZER_REJECT_UNAUTH));
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
    options.headers = defined(options.headers, {});
    options.headers['authorization'] = 'BEARER ' + options.token;
  }
  debug('instantiating client %j', options);
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
    options = defaults(options, { deflate: true });
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
      params.c = toBool(options.count);
    }
    if ('undefined' !== typeof options.one) {
      params.o = toBool(options.one);
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
      if (Array.isArray(obj) || Object.getOwnPropertyNames(obj).length > 0) {
        return deferred.resolve(!options.deflate ? obj : EJSON.deflate(obj));
      } else {
        return deferred.resolve(null);
      }
    });
    return deferred.promise;
  },

  post: function (uri, body, options) {
    var startTime = process.hrtime();
    options = defaults(options, { deflate: true });
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
    options = defaults(options, { deflate: true });
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
      params.m = toBool(options.multiple);
    }
    if ('undefined' !== typeof options.upsert) {
      params.u = toBool(options.upsert);
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
    options = defaults(options, { deflate: true });
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
      params.m = toBool(options.multiple);
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
  },

  aggregate: function (uri, pipeline, options) {
    var startTime = process.hrtime();
    options = defaults(options, { deflate: true });
    if (process.env.DOZER_BASE_URI) {
      uri = process.env.DOZER_BASE_URI + uri;
    }
    var deferred = q.defer();
    debug('parsing uri');
    var uriParts = url.parse(uri, true);
    debug('creating json client');
    var jsonClient = createJsonClient(uriParts, options);
    var params = {};
    if ('undefined' !== typeof options.explain) {
      params.e = toBool(options.explain);
    }
    debug('stringifing params');
    var qstr = qs.stringify(params);
    var uriPath = uriParts.pathname + '/aggregate';
    debug('performing request POST %s', uriPath + (qstr ? '?' + qstr : ''));
    pipeline = 'string' === typeof pipeline ? EJSON.parse(pipeline) : EJSON.inflate(pipeline);
    jsonClient.post(uriPath + (qstr ? '?' + qstr : ''), pipeline, function (err, req, res, obj) {
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

  distinct: function (uri, key, query, options) {
    var startTime = process.hrtime();
    options = defaults(options, { deflate: true });
    if (process.env.DOZER_BASE_URI) {
      uri = process.env.DOZER_BASE_URI + uri;
    }
    var deferred = q.defer();
    debug('parsing uri');
    var uriParts = url.parse(uri, true);
    debug('creating json client');
    var jsonClient = createJsonClient(uriParts, options);
    var uriPath = uriParts.pathname + '/distinct';
    debug('performing request POST %s', uriPath);
    key = 'object' === typeof key ? EJSON.stringify(key) : key;
    query = 'string' === typeof query ? EJSON.parse(query) : EJSON.inflate(query);
    var body = { key: key, query: query };
    jsonClient.post(uriPath, body, function (err, req, res, obj) {
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
