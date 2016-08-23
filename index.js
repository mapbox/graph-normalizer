'use strict';

var createGraph = require('./lib/create-graph');
var splitIntersections = require('./lib/split-intersections');
var mergeIntersections = require('./lib/merge-intersections');
var duplicateWays = require('./lib/duplicate-ways');

module.exports = {
  createGraph: createGraph,
  splitIntersections: splitIntersections,
  mergeIntersections: mergeIntersections,
  duplicateWays: duplicateWays,
  normalizeGraph: normalizeGraph
};

function normalizeGraph(nodes, ways, tile) {
  var graph = createGraph(nodes, ways, tile);
  splitIntersections(graph);
  mergeIntersections(graph);
  duplicateWays(graph);
  return graph;
}
