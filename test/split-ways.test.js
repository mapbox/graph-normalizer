'use strict';

var test = require('tap').test;
var normalizer = require('../');
var fs = require('fs');
var path = require('path');

test('split-ways', function (t) {
  var fixtures = fs.readdirSync(path.join(__dirname, './fixtures/split-ways/'));

  fixtures.forEach(function (fixture) {
    var before = JSON.parse(fs.readFileSync(path.join(__dirname, './fixtures/split-ways/', fixture, 'before')));
    var after = JSON.parse(fs.readFileSync(path.join(__dirname, './fixtures/split-ways/', fixture, 'after')));

    var result = normalizer.splitWays(before);

    t.deepEqual(result, after, fixture + ' output matches expected result');
  });

  t.end();
});
