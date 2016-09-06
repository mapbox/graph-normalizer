'use strict';

var test = require('tap').test;
var graphNormalizer = require('../index.js');
var nodes = require('./fixtures/nodes.json');
var ways = require('./fixtures/ways.json');
var tile = require('./fixtures/tile.json');

test('index', function (assert) {
  var graph = graphNormalizer.normalizeGraph(nodes, ways, tile);
  assert.equal(Object.keys(graph.intersections).length, 12);
  assert.equal(Object.keys(graph.ways).length, 34);
  var otherGraph = graphNormalizer.createGraph(nodes, ways, tile);
  graphNormalizer.splitIntersections(otherGraph);
  graphNormalizer.mergeIntersections(otherGraph);
  assert.equal(Object.keys(otherGraph.ways).length, 20);
  assert.end();
});
