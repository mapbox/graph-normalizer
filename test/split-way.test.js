'use strict';

var test = require('tap').test;
var splitWay = require('../lib/split-way');
var fixtures = require('./fixtures/split-way.json');

test('split-way', function (t) {
  fixtures.forEach(function (fixture) {
    var way = fixture.features[1];
    var intersection = fixture.features[0];
    var ways = splitWay(way, intersection);
    t.true(ways.length === 2 || ways.length === 0, 'way split in two or empty array returned');
    if (ways.length === 2) {
      t.equal(
        ways[0].geometry.coordinates.length + ways[1].geometry.coordinates.length,
        way.geometry.coordinates.length + 1,
        'split ways have 1 more coordinate than the original'
      );

      t.equal(
        ways[0].properties.refs.length + ways[1].properties.refs.length,
        way.properties.refs.length + 1,
        'split ways have 1 more ref than the original'
      );

      t.equal(
        ways[0].properties.id,
        way.properties.id + '!A',
        'wayA id appended correctly'
      );

      t.equal(
        ways[1].properties.id,
        way.properties.id + '!B',
        'wayB id appended correctly'
      );

      t.equal(
        ways[0].properties.refs[ways[0].properties.refs.length - 1],
        intersection.properties.id,
        'last ref of wayA is the intersection ref'
      );

      t.equal(
        ways[1].properties.refs[0],
        intersection.properties.id,
        'first ref of wayB is the intersection ref'
      );

      t.true(ways[0].properties.refs.indexOf(intersection.properties.id) !== -1, 'wayA should contain intersection node');
      t.true(ways[1].properties.refs.indexOf(intersection.properties.id) !== -1, 'wayB should contain intersection node');
    }
  });
  t.end();
});
