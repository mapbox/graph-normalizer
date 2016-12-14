'use strict';

var Benchmark = require('benchmark');
var normalizer = require('../');
var fs = require('fs');
var path = require('path');

var small = JSON.parse(fs.readFileSync(path.join(__dirname, './fixtures/small.json')));
var medium = JSON.parse(fs.readFileSync(path.join(__dirname, './fixtures/medium.json')));
var large = JSON.parse(fs.readFileSync(path.join(__dirname, './fixtures/large.json')));

new Benchmark.Suite('split-ways')
.add('split-ways # small', function () {
  normalizer.splitWays(small);
})
.add('split-ways # medium', function () {
  normalizer.splitWays(medium);
})
.add('split-ways # large', function () {
  normalizer.splitWays(large);
})
.on('cycle', function (event) {
  console.log(String(event.target));
})
.run();
