'use strict';

var normalizeWays = require('./lib/normalize-ways');

module.exports = {
  createQuadkeyWaysHash: normalizeWays.createQuadkeyWaysHash,
  normalizeWays: normalizeWays.normalizeWays,
};
