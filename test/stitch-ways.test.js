'use strict';

var test = require('tap').test;
var stitchWays = require('../lib/stitch-ways');
var fs = require('fs');
var path = require('path');

test('stitch-ways', function (t) {
  var fixtures = fs.readdirSync(path.join(__dirname, './fixtures/stitch-ways/'));

  fixtures.forEach(function (fixture) {
    var before = JSON.parse(fs.readFileSync(path.join(__dirname, './fixtures/stitch-ways/', fixture, 'before')));
    var after = JSON.parse(fs.readFileSync(path.join(__dirname, './fixtures/stitch-ways/', fixture, 'after')));

    var result = stitchWays(before);

    t.deepEqual(result, after, fixture + ' output matches expected result');
  });

  t.end();
});
