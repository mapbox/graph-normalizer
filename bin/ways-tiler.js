#!/usr/bin/env node

'use strict';

var fs = require('graceful-fs'); // avoids errors linked to too many file descriptors / open files
var path = require('path');
var readline = require('readline');
var cover = require('tile-cover');
var lineString = require('turf-linestring');
var argv = require('minimist')(process.argv.slice(2));

var OUTPUTPATH = argv.outputPath;
var ZOOM = argv.zoomLevel || 14;

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

rl.on('line', function (line) {

  var way = JSON.parse(line);
  // index the way's segments into tiles of given zoom level
  var tileQuadkeys = indexWay(way, ZOOM);

  // Consolidate each quadkey's pairs into way slices
  Object.keys(tileQuadkeys).forEach(function (quadkey) {

    var pairs = tileQuadkeys[quadkey];
    var tileWays = pairsToWays(pairs);

    for (var k = 0, n = tileWays.length; k < n; k++) {
      var tileWay = tileWays[k];

      // Differenciate each part of the way by appending to its id
      tileWay.properties.id = quadkey + '|' + way.properties.id + '|' + k;

      // persist the highway and oneway tags
      tileWay.properties.highway = way.properties.highway;
      tileWay.properties.oneway = way.properties.oneway;

      // write way to quadkey file
      fs.appendFile(path.join(OUTPUTPATH, quadkey + '.json'), JSON.stringify(tileWay) + '\n');
    }
  });
});


function indexWay(way, zoomLevel) {
  // index way segments and return a hash {quadkey: [pairs]}
  var tileQuadkeys = {};
  for (var i = 0; i < way.geometry.coordinates.length - 1; i++) {
    var pair = {
      coords: way.geometry.coordinates.slice(i, i + 2),
      ids: way.properties.refs.slice(i, i + 2)
    };
    // index the pair with a set of quadkeys
    var quadkeys = cover.indexes({type: 'LineString', coordinates: pair.coords}, {'min_zoom': zoomLevel,
                                                                                  'max_zoom': zoomLevel});
    // push the pair to each quadkey's array that it touches
    for (var j = 0; j < quadkeys.length; j++) {
      var quadkey = quadkeys[j];

      if (!tileQuadkeys[quadkey]) tileQuadkeys[quadkey] = [];

      tileQuadkeys[quadkey].push(pair);
    }
  }
  return tileQuadkeys;
}


function pairsToWays(pairs) {
  // given an array of pairs that belong to the same way and tile,
  // return an array of LineString ways.
  if (pairs.length === 0) return [];

  var ways = [];

  // initialize way with first pair
  var way = lineString(pairs[0].coords, {refs: pairs[0].ids});

  for (var i = 1, n = pairs.length; i < n; i++) {
    var pair = pairs[i];
    var lastNode = way.properties.refs[way.properties.refs.length - 1];

    if (pair.ids[0] === lastNode) {
      way.geometry.coordinates.push(pair.coords[1]);
      way.properties.refs.push(pair.ids[1]);
    } else {
      ways.push(JSON.parse(JSON.stringify(way)));

      way = lineString([], {refs: []});
      way.geometry.coordinates = pair.coords;
      way.properties.refs = pair.ids;
    }
  }

  // Add the last piece.
  ways.push(JSON.parse(JSON.stringify(way)));

  return ways;
}
