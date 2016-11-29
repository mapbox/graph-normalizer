'use strict';

var fs = require('graceful-fs');
var path = require('path');
var byline = require('byline');
var through2 = require('through2');
var queue = require('d3-queue').queue;
var argv = require('minimist')(process.argv.slice(2));

var wayDir = argv.wayDir;

function loadWays(wayPath, done) {
  var ways = [];
  fs.createReadStream(wayPath)
  .on('end', function () {
    done(null, ways);
  })
  .on('error', function (err) {
    done(err);
  })
  .pipe(byline.createStream())
  .pipe(through2(function (chunk, enc, next) {
    var way = JSON.parse(chunk);
    console.log(JSON.stringify(way));
    next();
  }));
}

fs.readdir(wayDir, function (err, sources) {
  if (err) throw err;
  var q = queue();

  for (var i = 0; i < sources.length; i++) {
    var source = sources[i];
    var wayFile = path.join(wayDir, source);
    q.defer(loadWays, wayFile);
  }

  q.awaitAll(function (error) {
    if (error) throw error;
  });
});
