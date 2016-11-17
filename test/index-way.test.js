'use strict';

var test = require('tap').test;
var indexWay = require('../lib/index-way');
var path = require('path');

var way = require(path.join(__dirname, 'fixtures', 'index-way', 'way.json'));
var result = require(path.join(__dirname, 'fixtures', 'index-way', 'result.json'));

test('index-way', function (t) {
  var quadkeys = Object.keys(result);
  var r = {};
  indexWay(way, quadkeys, r);
  t.equals(Object.keys(r).length, 16, 'all neighboring tiles are returned');
  t.same(r, result);
  t.end();
});
