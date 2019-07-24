'use strict';

var test = require('tap').test;
var indexWay = require('../lib/index-way');
var path = require('path');

var way = require(path.join(__dirname, 'fixtures', 'index-way', 'way.json'));
var wayZ13 = require(path.join(__dirname, 'fixtures', 'index-way', 'way-z13.json'));
var result = require(path.join(__dirname, 'fixtures', 'index-way', 'result.json'));


test('index-way', function (t) {
  var r = indexWay(way);
  t.equals(Object.keys(r).length, 4, '4 tiles have segments');
  t.same(r, result);
  t.end();
});

test('index-way z13', function (t) {
  var r = indexWay(way, 13);
  t.equals(Object.keys(r).length, 1, 'only one tile returned');
  var r2 = indexWay(wayZ13, 13);
  t.equals(Object.keys(r2).length, 1, 'way in 2 z13 tiles.');
  t.end();
});

var sampleWay = {
  'type': 'Feature',
  'properties': {'refs': ['2982064778', '2982064775', '2982064777', '261408719', '261386882']},
  'geometry': {
    'type': 'LineString',
    'coordinates': [[-73.652215, 40.624132], [-73.652344, 40.62412], [-73.652446, 40.624124], [-73.652537, 40.624144], [-73.654897, 40.624816]]
  }
};

var indexedWay = {'03201011120': [{'coords': [[-73.652215, 40.624132], [-73.652344, 40.62412]], 'ids': ['2982064778', '2982064775']}, {'coords': [[-73.652344, 40.62412], [-73.652446, 40.624124]], 'ids': ['2982064775', '2982064777']}, {'coords': [[-73.652446, 40.624124], [-73.652537, 40.624144]], 'ids': ['2982064777', '261408719']}, {'coords': [[-73.652537, 40.624144], [-73.654897, 40.624816]], 'ids': ['261408719', '261386882']}], '03201011121': [{'coords': [[-73.652215, 40.624132], [-73.652344, 40.62412]], 'ids': ['2982064778', '2982064775']}]};

test('index-way z13', function (t) {
  var r = indexWay(sampleWay, 11);
  t.same(r, indexedWay, 'indexed ways are accurate');
  t.end();
});
