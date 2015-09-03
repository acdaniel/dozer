var restify = require('restify');
var debug = require('debug')('dozer:collection');
var EJSON = require('mongodb-extended-json');
var config = require('./config');
var results = require('./results');

function toBool (value) {
  return value === true || value === 'true' || value === '1' || value === 'yes' ?
    true : false;
}

module.exports = {

  get: function (db) {
    return function (req, res, next) {
      debug('parsing params: %j', req.query);
      var query = req.query.q ? EJSON.parse(req.query.q) : {};
      var fields = req.query.f ? EJSON.parse(req.query.f) : undefined;
      var sort = req.query.s ? EJSON.parse(req.query.s) : undefined;
      var skip = req.query.i ? parseInt(req.query.i) : undefined;
      var limit = req.query.l ? parseInt(req.query.l) : 1000;
      var doCount = toBool(req.query.c);
      var doFindOne = toBool(req.query.o);

      debug('getting db collection');
      var collection = db.collection(req.params.collection);
      if (doCount) {
        var options = { limit: limit, skip: skip, sort: sort };
        debug('db.' + req.params.collection + '.count', query, options);
        collection.count(query, options, function (err, count) {
          if (err) { return next(err); }
          debug('sending response');
          res.json({ count: count });
          return next();
        });
      } else if (doFindOne) {
        var options = { limit: limit, skip: skip, sort: sort };
        debug('db.' + req.params.collection + '.findOne', query, options);
        collection.findOne(query, options, function (err, doc) {
          if (err) { return next(err); }
          debug('sending response');
          res.json(200, EJSON.inflate(doc));
          return next();
        });
      } else {
        var options = { fields: fields, limit: limit, skip: skip, sort: sort };
        debug('db.' + req.params.collection + '.find', query, options);
        collection.find(query, options).toArray(function (err, docs) {
          if (err) { return next(err); }
          debug('sending response');
          res.json(200, EJSON.inflate(docs));
          return next();
        });
      }
    }
  },

  post: function (db) {
    return function (req, res, next) {
      debug('getting db collection');
      var body = EJSON.deflate(req.body)
      var collection = db.collection(req.params.collection);
      if (Array.isArray(body)) {
        debug('db.' + req.params.collection + '.insertMany', body);
        collection.insertMany(body, function (err, r) {
          if (err) { return next(err); }
          debug('sending response');
          res.json(201, EJSON.inflate(results.writeResult(r)));
          return next();
        });
      } else {
        debug('db.' + req.params.collection + '.insertOne', body);
        collection.insertOne(body, function (err, r) {
          if (err) { return next(err); }
          debug('sending response');
          res.json(201, EJSON.inflate(results.writeResult(r)));
          return next();
        });
      }
    };
  },

  put: function (db) {
    return function (req, res, next) {
      debug('parsing params');
      var query = req.query.q ? EJSON.parse(req.query.q) : {};
      var update = EJSON.deflate(req.body);
      var multiple = toBool(req.query.m);
      var upsert = toBool(req.query.u);
      var options = { upsert: upsert };
      debug('getting db collection');
      var collection = db.collection(req.params.collection);
      if (multiple) {
        debug('db.' + req.params.collection + '.updateMany', query, update, options);
        collection.updateMany(query, update, options, function (err, r) {
          if (err) { return next(err); }
          debug('sending response');
          res.json(200, EJSON.inflate(results.writeResult(r)));
          return next();
        });
      } else {
        debug('db.' + req.params.collection + '.updateOne', query, update, options);
        collection.updateOne(query, update, options, function (err, r) {
          if (err) { return next(err); }
          debug('sending response');
          res.json(200, EJSON.inflate(results.writeResult(r)));
          return next();
        });
      }
    };
  },

  del: function (db) {
    return function (req, res, next) {
      debug('parsing params');
      var query = req.query.q ? EJSON.parse(req.query.q) : undefined;
      var multiple = toBool(req.query.m);
      if (!query) {
        return next(new restify.BadRequestError('Query parameter is required'));
      }
      debug('getting db collection');
      var collection = db.collection(req.params.collection);
      if (multiple) {
        debug('db.' + req.params.collection + '.deleteMany', query);
        collection.deleteMany(query, function (err, r) {
          if (err) { return next(err); }
          debug('sending response');
          res.json(200, EJSON.inflate(results.writeResult(r)));
          return next();
        });
      } else {
        debug('db.' + req.params.collection + '.deleteOne', query);
        collection.deleteOne(query, function (err, r) {
          if (err) { return next(err); }
          debug('sending response');
          res.json(200, EJSON.inflate(results.writeResult(r)));
          return next();
        });
      }
    };
  },

  aggregate: function (db) {
    return function (req, res, next) {
      debug('parsing params');
      var pipeline = EJSON.deflate(req.body);
      var explain = toBool(req.query.e);
      var options = { explain: explain };
      debug('getting db collection');
      var collection = db.collection(req.params.collection);
      debug('db.' + req.params.collection + '.aggregate', pipeline, options);
      collection.aggregate(pipeline, options, function (err, r) {
        if (err) { return next(err); }
        debug('sending response');
        res.json(200, EJSON.inflate(r));
        return next();
      });
    };
  },

  distinct: function (db) {
    return function (req, res, next) {
      debug('parsing params');
      console.trace(req.body);
      var body = EJSON.deflate(req.body);
      console.trace(body);
      var options = { };
      debug('getting db collection');
      var collection = db.collection(req.params.collection);
      debug('db.' + req.params.collection + '.distinct', body, options);
      collection.distinct(body.key, body.query, options, function (err, r) {
        if (err) { return next(err); }
        debug('sending response');
        res.json(200, EJSON.inflate(r));
        return next();
      });
    };
  }

};
