'use strict';

var mergeWays = require('./lib/merge-ways');
var splitWays = require('./lib/split-ways');
var unidirectionalWays = require('./lib/unidirectional-ways');

var graphNormalizer = {
  mergeWays: mergeWays,
  splitWays: splitWays,
  unidirectionalWays: unidirectionalWays
};

module.exports = graphNormalizer;
