'use strict';

var test = require('tap').test;
var stripRefs = require('../lib/strip-refs');
var graph = require('./fixtures/graph.json');

test('strip references', function (assert) {
  var way = {
    type: 'Feature',
    geometry: {
      type: 'LineString',
      coordinates: [[-123.65124106407166, 38.85672823278372], [-123.66, 38.84]]
    },
    properties: {
      id: 'wayId',
      refs: ['86318901', '86909596', 'notARealId'] // good ref, bad ref, inexistant ref.
    }
  };
  stripRefs(graph, way);
  assert.same(way.properties.refs, ['86318901']);
  assert.end();
});
