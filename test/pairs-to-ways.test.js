'use strict';

var test = require('tap').test;
var pairsToWays = require('../lib/pairs-to-ways');
var fs = require('fs');
var path = require('path');

test('pairs-to-ways', function (t) {
  var before = JSON.parse(fs.readFileSync(path.join(__dirname, './fixtures/pairs-to-ways/', 'before')));
  var after = JSON.parse(fs.readFileSync(path.join(__dirname, './fixtures/pairs-to-ways/', 'after')));

  var result = pairsToWays(before);

  t.deepEqual(result, after, 'output matches expected result');
  t.end();
});
