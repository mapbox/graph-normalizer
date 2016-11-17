'use strict';

var test = require('tap').test;
var neighborhoodQuadkeys = require('../lib/neighborhood-quadkeys');

var quadkeys = [
  '02301020333302',
  '02301020333303',
  '02301020333301',
  '02301020333300'
];

var neighborQuadkeys =  [
  '02301020333211',
  '02301020333213',
  '02301020333231',
  '02301020333300',
  '02301020333302',
  '02301020333320',
  '02301020333301',
  '02301020333303',
  '02301020333321',
  '02301020333310',
  '02301020333312',
  '02301020333330',
  '02301020333122',
  '02301020333123',
  '02301020333132',
  '02301020333033'
];

test('neighborhood-quadkeys', function (t) {
  var r = neighborhoodQuadkeys(quadkeys);
  t.equals(r.length, neighborQuadkeys.length, 'same length');
  t.same(JSON.stringify(r), JSON.stringify(neighborQuadkeys));
  t.end();
});
