'use strict';

var fs = require('graceful-fs');
var path = require('path');
var cover = require('tile-cover');
var byline = require('byline');
var through2 = require('through2');
var tileReduce = require('tile-reduce');
var tilebelt = require('tilebelt');
var stitcher = require('../lib/stitch-ways');

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

    // removing tile id
    // way.properties.id = way.properties.id.split(';')[0];

    var zoomLevel = 14;

    var coverQuadkeys = cover.indexes({type: 'LineString', coordinates: way.geometry.coordinates}, {
      'min_zoom': zoomLevel,
      'max_zoom': zoomLevel
    });

    if (coverQuadkeys.length > 1) {
      ways.push(way);
    } else {
      console.log(JSON.stringify(way));
    }
    next();
  }));
}

loadWays('./data/merged3.json', function (err, ways) {
  if (err) throw err;

  ways = stitcher(ways);
  for (var i = 0; i < ways.length; i++) {
    var way = ways[i];
    console.log(JSON.stringify(way));
  }
});
