var restify = require('restify');
var debug = require('debug')('dozer:document');
var bson = require('bson');
var EJSON = require('mongodb-extended-json');
var config = require('./config');
var results = require('./results');

module.exports = {

  get: function (db) {
    return function (req, res, next) {
      var query = req.query.q ? EJSON.parse(req.query.q) : {};
      query._id = bson.ObjectId(req.params.id);
      debug('getting db collection');
      var collection = db.collection(req.params.collection);
      debug('db.' + req.params.collection + '.findOne', query);
      collection.findOne(query, function (err, doc) {
        if (err) { return next(err); }
        debug('sending response');
        if (!doc) { return next(new restify.NotFoundError('Not found')); }
        res.json(200, EJSON.inflate(doc));
        return next();
      });
    }
  },

  put: function (db) {
    return function (req, res, next) {
      var query = req.query.q ? EJSON.parse(req.query.q) : {};
      query._id = bson.ObjectId(req.params.id);
      var update = EJSON.deflate(req.body);
      debug('getting db collection');
      var collection = db.collection(req.params.collection);
      debug('db.' + req.params.collection + '.updateOne', query, update);
      collection.updateOne(query, update, function (err, r) {
        if (err) { return next(err); }
        debug('sending response');
        res.json(200, EJSON.inflate(results.writeResult(r)));
        return next();
      });
    };
  },

  del: function (db) {
    return function (req, res, next) {
      var query = req.query.q ? EJSON.parse(req.query.q) : {};
      query._id = bson.ObjectId(req.params.id);
      debug('getting db collection');
      var collection = db.collection(req.params.collection);
      debug('db.' + req.params.collection + '.deleteOne', query);
      collection.deleteOne(query, function (err, r) {
        if (err) { return next(err); }
        debug('sending response');
        res.json(200, EJSON.inflate(results.writeResult(r)));
        return next();
      });
    };
  }

};
