'use strict';

var test = require('tap').test;
var createGraph = require('../lib/create-graph');
var splitIfBroken = require('../lib/create-graph').splitIfBroken;
var processWay = require('../lib/create-graph').processWay;
var nodes = require('./fixtures/nodes.json');
var ways = require('./fixtures/ways.json');
var tile = require('./fixtures/tile.json');

test('create intersection hash', function (assert) {
  var graph = createGraph(nodes, ways, tile);
  assert.equal(Object.keys(graph.intersections).length, 8, 'Eight intersections in the tile.');
  assert.equal(Object.keys(graph.ways).length, ways.length + 1, 'There is one MultiLineString way.');
  Object.keys(graph.ways).forEach(function (key) {
    var way = graph.ways[key];
    assert.true(way.geometry.coordinates.length >= way.properties.refs.length, 'Correctly stripped refs.');
  });
  assert.end();
});


test('split ways that are in several pieces within the tile', function (assert) {
  var way = {
    type: 'Feature',
    geometry: {
      type: 'MultiLineString',
      coordinates: [
        [[-123.64385426044464, 38.8494300025433], [-123.64245414733887, 38.849338091034184]],
        [[-123.63962173461914, 38.852195647858], [-123.64214301109314, 38.85265100815107]]
      ]
    },
    properties: {id: '10313835', refs: ['foo', 'bar']}
  };
  var splitWays = splitIfBroken(way);
  assert.equal(splitWays.length, 2, 'The way is split in two.');
  assert.same(splitWays[0].geometry.coordinates, way.geometry.coordinates[0], 'Same coordinates.');
  assert.same(splitWays[1].geometry.coordinates, way.geometry.coordinates[1], 'Same coordinates.');
  assert.equal(splitWays[0].properties.id, '10313835!0', 'ids are well assigned.');
  assert.equal(splitWays[1].properties.id, '10313835!1', 'ids are well assigned.');
  assert.equal(splitWays[0].geometry.type, 'LineString', 'geometries are LineStrings.');
  assert.end();
});


test('process way', function (assert) {
  var intersections = {
    '86318897': {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [-123.65156292915344, 38.856561138006896]
      },
      properties: {ways: []}
    }
  };
  var ways = [
    {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [
          [-123.65156292915344, 38.856561138006896], [-123.64245414733887, 38.849338091034184]
        ]
      },
      properties: {id: '001', refs: ['86318897', '86318888']}
    },
    {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [
          [-123.650, 38.856], [-123.64245414733887, 38.849338091034184]
        ]
      },
      properties: {id: '002', refs: ['86318897', '86318800']}
    }
  ];
  processWay(intersections, {})(ways[0]);
  processWay(intersections, {})(ways[1]);
  assert.same(ways[0].properties.refs, ['86318897'], 'Valid refs are kept.');
  assert.same(ways[1].properties.refs, [], 'Refs are well stripped.');
  assert.equal(intersections['86318897'].properties.ways.length, 1, 'Valid ways are kept.');
  assert.equal(intersections['86318897'].properties.ways[0], '001', 'Valid ways are kept.');
  assert.end();
});
