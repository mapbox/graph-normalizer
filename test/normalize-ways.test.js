'use strict';

var test = require('tap').test;
var fs = require('fs');
var path = require('path');
var exec = require('child_process').exec;
var execSync = require('child_process').execSync;

test('profile cli', function (t) {
  execSync('mkdir -p ' + path.join(__dirname, '../test_output'));
  var cmd = 'node ' + path.join(__dirname, '../bin/normalize-ways') +
            ' --outputPath ' + path.join(__dirname, '../test_output/') +
            ' --waysFile ' + path.join(__dirname, 'fixtures/osm-ways-7-25-47.geojson') +
            ' --zoomLevel 14';

  exec(cmd, function (err, stdout, stderr) {
    t.notOk(err, 'did not throw an error');
    t.notOk(stderr, 'did not write to stderr');
    t.equals(fs.readdirSync(path.join(__dirname, '../test_output')).length, 1321, 'Good number of files created.');
    var a = fs.readFileSync(path.join(__dirname, '../test_output/02132212323223.json'), {encoding: 'utf8'});
    var b = fs.readFileSync(path.join(__dirname, 'fixtures/normalize-ways/02132212323223.json'), {encoding: 'utf8'});
    t.equals(a, b, 'The output file matches expected');
    execSync('rm -rf ' + path.join(__dirname, '../test_output'));
    t.end();
  });
});
