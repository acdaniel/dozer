var debug = require('debug')('dozer:collections');

module.exports = {

  get: function (db) {
    return function (req, res, next) {
      db.collections(function (err, collections) {
        res.json(collections.map(function (item) {
          return {
            name: item.collectionName,
            namespace: item.namespace
          };
        }));
        return next();
      });
    }
  }

};
