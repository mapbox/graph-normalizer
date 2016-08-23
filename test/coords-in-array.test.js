'use strict';

var test = require('tap').test;
var coordsInArray = require('../lib/coords-in-array');

test('Find coordinates in the array', function (assert) {
  var array = [
    [-122.84191131591797, 38.15170241241815],
    [-122.838134765625, 38.148867552344306],
    [-122.83573150634764, 38.14900254817953],
    [-122.83264160156251, 38.15021749945389],
    [-122.82835006713867, 38.15008250586718],
    [-122.8252601623535, 38.15008250586718],
    [-122.82011032104494, 38.15089246363977]
  ];
  assert.equal(coordsInArray([-122.84191131591797, 38.15170241241815], array), 0);
  assert.equal(coordsInArray([-122.841911, 38.151702], array, 0, 6), 0);
  assert.equal(coordsInArray([-122.8419115, 38.1517024], array), -1);
  assert.equal(coordsInArray([-122.82011032, 38.15089246], array, 2, 8), 6);
  assert.equal(coordsInArray([-122.84191131591797, 38.15170241241815], array, 1), -1);
  assert.end();
});
