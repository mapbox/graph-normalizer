'use strict';

var test = require('tap').test;
var mergeWays = require('../lib/merge-ways');
var fs = require('fs');
var path = require('path');

test('merge-ways', function (t) {
  var fixtures = fs.readdirSync(path.join(__dirname, './fixtures/merge-ways/'));

  fixtures.forEach(function (fixture) {
    var before = JSON.parse(fs.readFileSync(path.join(__dirname, './fixtures/merge-ways/', fixture, 'before')));
    var after = JSON.parse(fs.readFileSync(path.join(__dirname, './fixtures/merge-ways/', fixture, 'after')));

    var result = mergeWays(before);
    t.deepEqual(result, after, fixture + ' output matches expected result');
  });

  t.end();
});
