'use strict';

var test = require('tap').test;
var crop = require('../lib/crop-out-tile');
var fs = require('fs');
var path = require('path');

test('crop-out-tile', function (t) {
  var fixtures = fs.readdirSync(path.join(__dirname, './fixtures/crop-out-tile/'));

  fixtures.forEach(function (fixture) {
    var before = JSON.parse(fs.readFileSync(path.join(__dirname, './fixtures/crop-out-tile/', fixture, 'before')));
    var after = JSON.parse(fs.readFileSync(path.join(__dirname, './fixtures/crop-out-tile/', fixture, 'after')));

    var result = crop(before, 14);
    t.deepEqual(result, after, fixture + ' output matches expected result');
  });

  t.end();
});
