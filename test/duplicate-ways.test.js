'use strict';

var test = require('tap').test;
var graph = require('./fixtures/graph.json');
var clone = require('../lib/clone');
var duplicateWays = require('../lib/duplicate-ways');

test('duplicate ways', function (assert) {
  var g = clone(graph);
  duplicateWays(g);
  assert.same(g.ways['10306784!R'].geometry.coordinates[0], [-123.64559233188629, 38.84671020719739],
              'coordinates have been reversed.');
  assert.true(g.intersections['1912690952'].properties.ways.indexOf('10306784!R') > -1,
               'intersections have been filled.');
  assert.equal(g.ways['10311012!R'], undefined, 'oneways are not duplicated.');
  assert.end();
});
