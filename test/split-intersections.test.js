'use strict';

var test = require('tap').test;
var splitIntersections = require('../lib/split-intersections');
var graph = require('./fixtures/graph.json');
var clone = require('../lib/clone');

test('split intersections', function (assert) {
  var g = clone(graph);
  splitIntersections(g);
  Object.keys(g.ways).forEach(function (id) {
    var way = g.ways[id];
    for (var i = 1; i < way.properties.refs.length - 1; i++) {
      var node = way.properties.refs[i];
      assert.true(g.intersections[node] === undefined, 'no middle node is an intersection.');
    }
  });
  assert.end();
});
