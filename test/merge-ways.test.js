'use strict';

var test = require('tap').test;
var mergeWays = require('../lib/merge-ways');
var fixtures = require('./fixtures/merge-ways.json');

test('merge ways', function (t) {
  fixtures.forEach(function (fixture) {
    var way = mergeWays(fixture.wayA, fixture.node, fixture.wayB);

    t.true(
      typeof way === 'object' || typeof way === 'undefined',
      'a way or undefined should be returned'
    );

    if (typeof way === 'object') {

      t.true(
        fixture.wayA.properties.refs.indexOf(fixture.node) !== -1,
        'node should be present in both ways'
      );

      t.true(
        fixture.wayB.properties.refs.indexOf(fixture.node) !== -1,
        'node should be present in both ways'
      );

      t.equal(
       way.properties.id,
       fixture.wayA.properties.id + '!M!' + fixture.wayB.properties.id,
       'way id appended correctly'
      );

      t.equal(
        way.geometry.coordinates.length,
        fixture.wayA.geometry.coordinates.length + fixture.wayB.geometry.coordinates.length - 1,
        'merge geometry does not duplicate merging node geometry'
      );

      t.equal(
        way.properties.refs.length,
        fixture.wayA.properties.refs.length + fixture.wayB.properties.refs.length - 1,
        'merge refs does not duplicate merging node ref'
      );

      t.true(
        fixture.wayA.properties.refs[0] === way.properties.refs[0] || fixture.wayB.properties.refs[0] === way.properties.refs[0],
        'merge way share first node with one of the orignal way'
      );

      t.true(
        fixture.wayA.properties.refs[fixture.wayA.properties.refs.length - 1] === way.properties.refs[way.properties.refs.legnth - 1] || fixture.wayB.properties.refs[fixture.wayB.properties.refs.length - 1] === way.properties.refs[way.properties.refs.length - 1],
        'merge way share last node with one of the orignal way'
      );

      t.true(
        fixture.wayA.properties.refs[fixture.wayA.properties.refs.length - 1] === way.properties.refs[way.properties.refs.legnth - 1] || fixture.wayB.properties.refs[fixture.wayB.properties.refs.length - 1] === way.properties.refs[way.properties.refs.length - 1],
        'merge way share last node with one of the orignal way'
      );

    }
  });
  t.end();
});
