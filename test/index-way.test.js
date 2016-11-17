'use strict';

var test = require('tap').test;
var indexWay = require('../lib/index-way');
var path = require('path');

var way = require(path.join(__dirname, 'fixtures', 'index-way', 'way.json'));
var wayZ13 = require(path.join(__dirname, 'fixtures', 'index-way', 'way-z13.json'));
var result = require(path.join(__dirname, 'fixtures', 'index-way', 'result.json'));


test('index-way', function (t) {
  var r = indexWay(way);
  t.equals(Object.keys(r).length, 16, 'all neighboring tiles are returned');
  t.same(r, result);
  t.end();
});

test('index-way z13', function (t) {
  var r = indexWay(way, 13);
  t.equals(Object.keys(r).length, 9, 'all neighboring tiles are returned');
  var r2 = indexWay(wayZ13, 13);
  t.equals(Object.keys(r2).length, 9, 'all neighboring tiles are returned');
  t.end();
});
