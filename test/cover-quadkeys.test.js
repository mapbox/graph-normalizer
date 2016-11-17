'use strict';

var test = require('tap').test;
var coverQuadkeys = require('../lib/cover-quadkeys');
var path = require('path');

var way = require(path.join(__dirname, 'fixtures', 'cover-quadkeys', 'way.json'));

var wayQuadkeys =  [
  '02301020333302',
  '02301020333303',
  '02301020333301',
  '02301020333300'
];

test('cover-quadkeys', function (t) {
  var r = coverQuadkeys(way);
  t.equals(r.length, wayQuadkeys.length, 'same length');
  t.same(JSON.stringify(r), JSON.stringify(wayQuadkeys));
  t.end();
});
