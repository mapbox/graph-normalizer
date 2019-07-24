'use strict';

var test = require('tap').test;
var fs = require('fs');
var path = require('path');
var exec = require('child_process').exec;
var byline = require('byline');
var through2 = require('through2');
var execSync = require('child_process').execSync;

test('normalize-ways cli', function (t) {
  execSync('mkdir -p ' + path.join(__dirname, '../test_output'));
  var cmd = 'node ' + path.join(__dirname, '../bin/normalize-ways') +
            ' --outputPath ' + path.join(__dirname, '../test_output/') +
            ' --waysFile ' + path.join(__dirname, 'fixtures/osm-ways-7-25-47.geojson') +
            ' --zoomLevel 14';

  exec(cmd, function (err, stdout, stderr) {
    t.notOk(err, 'did not throw an error');
    t.notOk(stderr, 'did not write to stderr');
    t.equals(fs.readdirSync(path.join(__dirname, '../test_output')).length, 541, 'Good number of files created.');
    var a = fs.readFileSync(path.join(__dirname, '../test_output/02132212323223.json'), {encoding: 'utf8'});
    var b = fs.readFileSync(path.join(__dirname, 'fixtures/normalize-ways/02132212323223.json'), {encoding: 'utf8'});
    t.equals(a, b, 'The output file matches expected');
    execSync('rm -rf ' + path.join(__dirname, '../test_output'));
    t.end();
  });
});

test('normalize-ways cli with tricky boundary way', function (t) {
  execSync('mkdir -p ' + path.join(__dirname, '../test_output'));
  var cmd = 'node ' + path.join(__dirname, '../bin/normalize-ways') +
            ' --outputPath ' + path.join(__dirname, '../test_output/') +
            ' --waysFile ' + path.join(__dirname, 'fixtures/osm-ways-7-37-48.geojson') +
            ' --zoomLevel 11';

  exec(cmd, function (err, stdout, stderr) {
    t.notOk(err, 'did not throw an error');
    t.notOk(stderr, 'did not write to stderr');
    t.equals(fs.readdirSync(path.join(__dirname, '../test_output')).length, 2, 'Good number of files created.');

    var a = JSON.parse(fs.readFileSync(path.join(__dirname, '../test_output/03201011120.json'), {encoding: 'utf8'}));
    var b = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures/normalize-ways/03201011120.json'), {encoding: 'utf8'}));
    t.same(a, b, 'The output file matches expected');

    a = JSON.parse(fs.readFileSync(path.join(__dirname, '../test_output/03201011121.json'), {encoding: 'utf8'}));
    b = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures/normalize-ways/03201011121.json'), {encoding: 'utf8'}));
    t.same(a, b, 'The output file matches expected');
    execSync('rm -rf ' + path.join(__dirname, '../test_output'));
    t.end();
  });
});

test('normalize-ways cli with openLR', function (t) {
  execSync('mkdir -p ' + path.join(__dirname, '../test_output'));
  var cmd = 'node ' + path.join(__dirname, '../bin/normalize-ways') +
            ' --outputPath ' + path.join(__dirname, '../test_output/') +
            ' --waysFile ' + path.join(__dirname, 'fixtures/osm-ways-7-64-44.geojson') +
            ' --zoomLevel 11 --openLR';

  exec(cmd, function (err, stdout, stderr) {
    t.notOk(err, 'did not throw an error');
    t.notOk(stderr, 'did not write to stderr');
    t.equals(fs.readdirSync(path.join(__dirname, '../test_output')).length, 2, 'Good number of files created.');

    var outputA = [];
    var expectedA = [];
    var outputB = [];
    var expectedB = [];
    fs.createReadStream(path.join(__dirname, '../test_output/12022001101.json'))
    .on('error', function (err) {
      throw err;
    })
    .pipe(byline.createStream())
    .pipe(through2(function (chunk, enc, next) {
      outputA.push(JSON.parse(chunk));
      next();
    }))
    .on('finish', function () {
      fs.createReadStream(path.join(__dirname, 'fixtures/normalize-ways/12022001101.json'))
      .on('error', function (err) {
        throw err;
      })
      .pipe(byline.createStream())
      .pipe(through2(function (chunk, enc, next) {
        expectedA.push(JSON.parse(chunk));
        next();
      }))
      .on('finish', function () {
        outputA.sort();
        expectedA.sort();
        t.same(outputA, expectedA, 'matching results after OpenLR insertion');
        fs.createReadStream(path.join(__dirname, '../test_output/12022001110.json'))
        .on('error', function (err) {
          throw err;
        })
        .pipe(byline.createStream())
        .pipe(through2(function (chunk, enc, next) {
          outputB.push(JSON.parse(chunk));
          next();
        }))
        .on('finish', function () {
          fs.createReadStream(path.join(__dirname, 'fixtures/normalize-ways/12022001110.json'))
          .on('error', function (err) {
            throw err;
          })
          .pipe(byline.createStream())
          .pipe(through2(function (chunk, enc, next) {
            expectedB.push(JSON.parse(chunk));
            next();
          }))
          .on('finish', function () {
            outputB.sort();
            expectedB.sort();
            t.same(outputB, expectedB, 'matching results after OpenLR insertion');
            execSync('rm -rf ' + path.join(__dirname, '../test_output'));
            t.end();
          });
        });
      });
    });
  });
});
