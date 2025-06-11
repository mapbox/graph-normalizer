

const mergeWays = require('./lib/merge-ways');
const splitWays = require('./lib/split-ways');

const graphNormalizer = {
    mergeWays,
    splitWays
};

module.exports = graphNormalizer;
