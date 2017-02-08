'use strict';

var test = require('tap').test;
var normalizer = require('../');
var fs = require('fs');
var path = require('path');

test('merge-ways', function (t) {
  var fixtures = fs.readdirSync(path.join(__dirname, './fixtures/merge-ways/'));

  fixtures.forEach(function (fixture) {
    var options = JSON.parse(fs.readFileSync(path.join(__dirname, './fixtures/merge-ways/', fixture, 'options')));
    if (options === 'undefined') options = undefined;
    var before = JSON.parse(fs.readFileSync(path.join(__dirname, './fixtures/merge-ways/', fixture, 'before')));
    var after = JSON.parse(fs.readFileSync(path.join(__dirname, './fixtures/merge-ways/', fixture, 'after')));

    var result = normalizer.mergeWays(before, options);
    t.deepEqual(result, after, fixture + ' output matches expected result');
  });

  t.end();
});
