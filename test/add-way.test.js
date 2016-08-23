'use strict';

var test = require('tap').test;
var graph = require('./fixtures/graph.json');
var addWay = require('../lib/add-way');
var clone = require('../lib/clone');

test('add way', function (assert) {
  var g = clone(graph);
  var originalWay = graph.ways['180804953'];
  var newWay = clone(originalWay);
  newWay.properties.id = 'newid';
  addWay(g, newWay);
  assert.equal(g.ways['newid'], newWay);
  newWay.properties.refs.forEach(function (i) {
    assert.true(g.intersections[i] === undefined || (g.intersections[i].properties.ways.indexOf('newid') > -1));
  });
  assert.end();
});
