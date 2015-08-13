var restify = require('restify');
var bunyan = require('bunyan');
var debug = require('debug')('dozer:server');
var config = require('./config');

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

server.use(function (req, res, next) {
  var apiKeys = config.get('apiKeys');
  var remoteAddr = req.socket.remoteAddress;
  if (remoteAddr !== '127.0.0.1' && remoteAddr !== '::' && apiKeys.indexOf(req.username) === -1) {
    debug('authentication failed for user %s', req.username);
    return next(new restify.UnauthorizedError('Unauthorized'));
  }
  debug('authentication passed for user %s@%s', req.username, remoteAddr);
  return next();
});

server.on('after', restify.auditLogger({
  log: bunyan.createLogger({
    name: 'audit',
    stream: process.stdout
  })
}));

server.start = function (options, cb) {
  debug('starting server');
  config.load(options);
  config.validate({strict: true});
  MongoClient.connect(config.get('db.uri'), function (err, db) {
    if (err) { return cb(err); }
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
  server.db.close();
  server.close();
};

module.exports = server;
