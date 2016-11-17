'use strict';

var test = require('tap').test;
var selectTileWays = require('../lib/select-tile-ways');
var path = require('path');

var way = require(path.join(__dirname, 'fixtures', 'index-way', 'way.json'));
var wayQuadkeys =  [
  '02301020333302',
  '02301020333303',
  '02301020333301',
  '02301020333300'
];
var neighborQuadkeys = [
  '02301020333211',
  '02301020333033',
  '02301020333122'
];

test('keep-way', function (t) {
  for (var i = 0; i < wayQuadkeys.length; i++) {
    var quadkey = wayQuadkeys[i];
    var r = selectTileWays(quadkey, [way], 14);
    t.equals(r.length, 1, 'way was not filtered');
    t.same(JSON.stringify(r[0]), JSON.stringify(way));
  }
  t.end();
});

test('remove-way', function (t) {
  for (var i = 0; i < neighborQuadkeys.length; i++) {
    var quadkey = neighborQuadkeys[i];
    var r = selectTileWays(quadkey, [way], 14);
    t.equals(r.length, 0, 'way filtered');
    t.same(r, []);
  }
  t.end();
});
