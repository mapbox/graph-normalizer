'use strict';

var test = require('tap').test;
var graph = require('./fixtures/graph.json');
var deleteWay = require('../lib/delete-way');
var clone = require('../lib/clone');

test('add way', function (assert) {
  var g = clone(graph);
  var originalWay = graph.ways['180804953'];
  deleteWay(g, originalWay);
  assert.equal(g.ways['180804953'], undefined);
  Object.keys(graph.intersections).forEach(function (i) {
    assert.true(g.intersections[i].properties.ways.indexOf('180804953') === -1);
  });
  assert.end();
});
