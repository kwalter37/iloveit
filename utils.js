// utils.js
var _ = require("underscore");

// from queryParams, return only valid ones
function getFilterParams(queryParams, allValidFilters) {
  var filterKeys = _.keys(allValidFilters);
  var validFilters = _.pick(queryParams, filterKeys);

  // we will get numbers as strings, so need to convert
  return _.mapObject(validFilters, function (val, key) {
      if (allValidFilters[key] === 'int') {
        return parseInt(val, 10);
      }
      else {
        return val;
      }
  });
}

module.exports.getFilterParams = getFilterParams;