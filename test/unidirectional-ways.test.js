'use strict';

var test = require('tap').test;
var normalizer = require('../');

test('unidirectional-ways', function (t) {
  var ways = [
    {
      'type': 'Feature',
      'geometry': {'type': 'LineString', 'coordinates': [[-121.640738, 36.658681], [-121.640598, 36.658655], [-121.640459, 36.658638]]},
      'properties': {'id': '1', 'refs': ['90004257', '90004259', '90004261'], 'oneway': 0, 'highway': 'secondary'}
    },
    {
      'type': 'Feature',
      'geometry': {'type': 'LineString', 'coordinates': [[-121.640067, 36.660187], [-121.641553, 36.662188]]},
      'properties': {'id': '2', 'refs': ['89888084', '89888188'], 'oneway': 1, 'highway': 'primary'}
    }
  ];

  var results = [
    {
      'type': 'Feature',
      'geometry': {'type': 'LineString', 'coordinates': [[-121.640459, 36.658638], [-121.640598, 36.658655], [-121.640738, 36.658681]]},
      'properties': {'id': 'r1', 'refs': ['90004261', '90004259', '90004257'], 'oneway': 1, 'highway': 'secondary'}
    },
    {
      'type': 'Feature',
      'geometry': {'type': 'LineString', 'coordinates': [[-121.640738, 36.658681], [-121.640598, 36.658655], [-121.640459, 36.658638]]},
      'properties': {'id': 'f1', 'refs': ['90004257', '90004259', '90004261'], 'oneway': 1, 'highway': 'secondary'}
    },
    {
      'type': 'Feature',
      'geometry': {'type': 'LineString', 'coordinates': [[-121.640067, 36.660187], [-121.641553, 36.662188]]},
      'properties': {'id': 'f2', 'refs': ['89888084', '89888188'], 'oneway': 1, 'highway': 'primary'}
    }
  ];

  t.same(normalizer.unidirectionalWays(ways), results);
  t.end();
});
