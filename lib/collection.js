var restify = require('restify');
var debug = require('debug')('dozer:collection');
var etag = require('etag');
var config = require('./config');

module.exports = {

  get: function (db) {
    return function (req, res, next) {
      var query = req.query.q ? JSON.parse(req.query.q) : {};
      var fields = req.query.f ? JSON.parse(req.query.f) : undefined;
      var sort = req.query.s ? JSON.parse(req.query.s) : undefined;
      var skip = req.query.k ? parseInt(req.query.k) : undefined;
      var limit = req.query.l ? parseInt(req.query.l) : 1000;
      var doCount = !!req.query.c;
      var doFindOne = !!req.query.o;

      var collection = db.collection(req.params.collection);
      if (doCount) {
        var options = { limit: limit, skip: skip };
        debug('db.' + req.params.collection + '.count', query, options);
        collection.count(query, options, function (err, count) {
          if (err) { return next(err); }
          res.json({ count: count });
          return next();
        });
      } else if (doFindOne) {
        var options = { limit: limit, skip: skip, sort: sort };
        debug('db.' + req.params.collection + '.findOne', query, options);
        collection.findOne(query, options, function (err, doc) {
          if (err) { return next(err); }
          res.json(doc);
          return next();
        });
      } else {
        var options = { fields: fields, limit: limit, skip: skip, sort: sort };
        debug('db.' + req.params.collection + '.find', query, options);
        collection.find(query, options).toArray(function (err, docs) {
          if (err) { return next(err); }
          res.json(docs);
          return next();
        });
      }
    }
  },

  post: function (db) {
    return function (req, res, next) {
      var collection = db.collection(req.params.collection);
      if (Array.isArray(req.body)) {
        if (config.get('etags')) {
          req.body.forEach(function (item) {
            item._etag = etag(JSON.stringify(item));
          });
        }
        debug('db.' + req.params.collection + '.insertMany', req.body);
        collection.insertMany(req.body, function (err, r) {
          if (err) { return next(err); }
          res.status(201);
          res.json(r);
          return next();
        });
      } else {
        if (config.get('etags')) {
          req.body._etag = etag(JSON.stringify(req.body));
        }
        debug('db.' + req.params.collection + '.insertOne', req.body);
        collection.insertOne(req.body, function (err, r) {
          if (err) { return next(err); }
          res.status(201);
          res.json(r);
          return next();
        });
      }
    };
  },

  put: function (db) {
    return function (req, res, next) {
      var query = req.query.q ? JSON.parse(req.query.q) : {};
      var update = req.body;
      var multiple = !!req.query.m;
      var upsert = !!req.query.u;
      var options = { upsert: upsert };
      var collection = db.collection(req.params.collection);
      if (multiple) {
        debug('db.' + req.params.collection + '.updateMany', query, update, options);
        collection.updateMany(query, update, options, function (err, r) {
          if (err) { return next(err); }
          res.json(r);
          return next();
        });
      } else {
        debug('db.' + req.params.collection + '.updateOne', query, update, options);
        collection.updateOne(query, update, options, function (err, r) {
          if (err) { return next(err); }
          res.json(r);
          return next();
        });
      }
    };
  },

  del: function (db) {
    return function (req, res, next) {
      var query = req.query.q ? JSON.parse(req.query.q) : undefined;
      var multiple = !!req.query.m;
      if (!query) {
        return next(new restify.BadRequestError('Query parameter is required'));
      }
      var collection = db.collection(req.params.collection);
      if (multiple) {
        debug('db.' + req.params.collection + '.deleteMany', query);
        collection.deleteMany(query, function (err, r) {
          if (err) { return next(err); }
          res.json(r);
          return next();
        });
      } else {
        debug('db.' + req.params.collection + '.deleteOne', query);
        collection.deleteOne(query, function (err, r) {
          if (err) { return next(err); }
          res.json(r);
          return next();
        });
      }
    };
  }

};
