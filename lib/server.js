var restify = require('restify');
var bunyan = require('bunyan');
var q = require('q');
var fs = require('fs');
var debug = require('debug')('dozer:server');
var jwt = require('restify-jwt');
var package = require('../package.json');
var config = require('./config');

var auth = require('./auth');
var collections = require('./collections');
var collection = require('./collection');
var document = require('./document');

var MongoClient = require('mongodb').MongoClient
var server = undefined;

module.exports = {

  start: function (options) {
    debug('starting server');
    if (options) {
      config.load(options);
      config.validate({strict: true});
    }

    var serverOptions = {
      name: config.get('server.name'),
      version: package.version
    };
    if (config.get('server.certificate')) {
      debug('using certificate ' + config.get('server.certificate'));
      serverOptions.certificate = fs.readFileSync(config.get('server.certificate'));
    }
    if (config.get('server.key')) {
      debug('using key ' + config.get('server.key'));
      serverOptions.key = fs.readFileSync(config.get('server.key'));
    }

    server = restify.createServer(serverOptions);
    server.use(restify.acceptParser(server.acceptable));
    server.use(restify.authorizationParser());
    server.use(restify.dateParser());
    server.use(restify.queryParser());
    server.use(restify.gzipResponse());
    server.use(restify.bodyParser({
      mapParams: false,
      mapFiles: false
    }));
    server.use(restify.conditionalRequest());

    if (config.get('auth.enabled')) {
      server.use(jwt({
        secret: config.get('auth.secret'),
        issuer: config.get('auth.issuer'),
        requestProperty: 'auth',
        getToken: function fromHeaderOrQuerystring (req) {
          if (req.headers.authorization) {
            var auth = req.headers.authorization.split(' ');
            if (auth[0].toUpperCase() === 'BEARER' || auth[0].toUpperCase() === 'JWT') {
              return auth[1];
            }
          } else if (req.query && req.query.token) {
            return req.query.token;
          }
          return null;
        },
        isRevoked: function (req, payload, done) {
          var blacklist = config.get('auth.blacklist');
          blacklist.forEach(function (item) {
            if (item.aud && payload.aud === item.aud) {
              return done(new restify.ForbiddenError('Access Revoked'));
            }
            if (item.jti && payload.jti === item.jti) {
              return done(new restify.ForbiddenError('Access Revoked'));
            }
          });
          return done(null, false);
        }
      }));
    }

    debug('connecting to database %s', config.get('db.uri'));
    return MongoClient.connect(config.get('db.uri'))
      .then(function (db) {
        server.db = db;
        debug('connected to database %s', db.databaseName);

        server.get(
          '/db/collections',
          auth('collections.get'),
          collections.get(db)
        );
        server.get(
          '/db/:collection',
          auth(function (req) { return req.params.collection + '.get'; }),
          collection.get(db)
        ),
        server.post(
          '/db/:collection',
          auth(function (req) { return req.params.collection + '.post'; }),
          collection.post(db)
        );
        server.put(
          '/db/:collection',
          auth(function (req) { return req.params.collection + '.put'; }),
          collection.put(db)
        );
        server.del(
          '/db/:collection',
          auth(function (req) { return req.params.collection + '.delete'; }),
          collection.del(db)
        );
        server.post(
          '/db/:collection/aggregate',
          auth(function (req) { return req.params.collection + '.aggregate'; }),
          collection.aggregate(db)
        );
        server.post(
          '/db/:collection/distinct',
          auth(function (req) { return req.params.collection + '.distinct'; }),
          collection.distinct(db)
        );
        server.get(
          '/db/:collection/:id',
          auth(function (req) { return req.params.collection + '.get'; }),
          document.get(db));
        server.put(
          '/db/:collection/:id',
          auth(function (req) { return req.params.collection + '.put'; }),
          document.put(db)
        );
        server.del(
          '/db/:collection/:id',
          auth(function (req) { return req.params.collection + '.delete'; }),
          document.del(db)
        );

        server.on('after', restify.auditLogger({
          log: bunyan.createLogger({
            name: 'audit',
            stream: process.stdout
          })
        }));

        server.listen(
          config.get('server.port'),
          config.get('server.host'),
          function () {
            debug('%s listening at %s', server.name, server.url);
          }
        );
      });
  },

  stop: function () {
    debug('stopping server');
    if (server.db) {
      server.db.close();
    }
    server.close();
  }

};
