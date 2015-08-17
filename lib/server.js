var restify = require('restify');
var bunyan = require('bunyan');
var q = require('q');
var debug = require('debug')('dozer:server');
var config = require('./config');

var auth = require('./auth');
var collections = require('./collections');
var collection = require('./collection');
var document = require('./document');

var MongoClient = require('mongodb').MongoClient

var server = restify.createServer({
  name: config.get('server.name'),
  version: '1.0.0',
  certificate: config.get('server.certificate'),
  key: config.get('server.key')
});
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

server.start = function (options) {
  debug('starting server');
  config.load(options);
  config.validate({strict: true});

  if (config.get('auth.enabled')) {
    server.use(auth());
  }

  return MongoClient.connect(config.get('db.uri'))
    .then(function (db) {
      server.db = db;
      debug('connected to database %s', db.databaseName);

      server.get('/db/collections', collections.get(db));
      server.get('/db/:collection', collection.get(db));
      server.post('/db/:collection', collection.post(db));
      server.put('/db/:collection', collection.put(db));
      server.del('/db/:collection', collection.del(db));
      server.get('/db/:collection/:id', document.get(db));
      server.put('/db/:collection/:id', document.put(db));
      server.del('/db/:collection/:id', document.del(db));

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
};

server.stop = function () {
  debug('stopping server');
  server.authDb.close();
  server.db.close();
  server.close();
};

module.exports = server;
