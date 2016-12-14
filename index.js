'use strict';

var mergeWays = require('./lib/merge-ways');
var splitWays = require('./lib/split-ways');

var graphNormalizer = {
  mergeWays: mergeWays,
  splitWays: splitWays
};

module.exports = graphNormalizer;
