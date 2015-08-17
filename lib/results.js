
module.exports = {

  writeResult: function (r) {
    var result = {
      result: r.result,
      ops: r.ops
    };
    if ('undefined' !== typeof r.insertedCount) {
      result.insertedCount = r.insertedCount;
    }
    if ('undefined' !== typeof r.insertedIds) {
      result.insertedIds = r.insertedIds;
    }
    if ('undefined' !== typeof r.matchedCount) {
      result.matchedCount = r.matchedCount;
    }
    if ('undefined' !== typeof r.modifiedCount) {
      result.modifiedCount = r.modifiedCount;
    }
    if ('undefined' !== typeof r.upsertedCount) {
      result.upsertedCount = r.upsertedCount;
    }
    if ('undefined' !== typeof r.deletedCount) {
      result.deletedCount = r.deletedCount;
    }
    if ('undefined' !== typeof r.upsertedIds) {
      result.upsertedIds = r.upsertedIds;
    }
    return result;
  }

};
