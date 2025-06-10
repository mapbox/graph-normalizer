

const mergeWays = require('./lib/merge-ways');
const splitWays = require('./lib/split-ways');
const unidirectionalWays = require('./lib/unidirectional-ways');

const graphNormalizer = {
    mergeWays,
    splitWays,
    unidirectionalWays
};

module.exports = graphNormalizer;
