'use strict';

var Benchmark = require('benchmark');
var normalizer = require('../');
var fs = require('fs');
var path = require('path');

var small = JSON.parse(fs.readFileSync(path.join(__dirname, './fixtures/small.json')));
var medium = JSON.parse(fs.readFileSync(path.join(__dirname, './fixtures/medium.json')));
var large = JSON.parse(fs.readFileSync(path.join(__dirname, './fixtures/large.json')));

new Benchmark.Suite('merge-ways')
.add('merge-ways # small', function () {
  normalizer.mergeWays(small);
})
.add('merge-ways # medium', function () {
  normalizer.mergeWays(medium);
})
.add('merge-ways # large', function () {
  normalizer.mergeWays(large);
})
.on('cycle', function (event) {
  console.log(String(event.target));
})
.run();
