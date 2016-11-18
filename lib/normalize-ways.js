'use strict';

var byline = require('byline');
var fs = require('graceful-fs');
var tilebelt = require('tilebelt');
var indexWay = require('../lib/index-way');
var getCoveringQuadkeys = require('../lib/cover-quadkeys');
var getNeighborhoodQuadkeys = require('../lib/neighborhood-quadkeys');
var splitWays = require('../lib/split-ways');
var mergeWays = require('../lib/merge-ways');
var selectTileWays = require('../lib/select-tile-ways');

module.exports.createQuadkeyWaysHash = createQuadkeyWaysHash;
module.exports.normalizeWays = normalizeWays;

function createQuadkeyWaysHash(waysFile, zoomLevel, callback) {
  var quadHash = {};

  var waysStream = byline(fs.createReadStream(waysFile), {encoding: 'utf8'});

  waysStream.on('data', function (line) {
    // hash ways into the quadHash
    var way = JSON.parse(line);

    // parse refs if they are in string format
    if (typeof way.properties.refs === 'string') {
      way.properties.refs = way.properties.refs.split(',');
    }

    // throw out ways that have a different number of refs vs coordinates
    if (way.properties.refs !== undefined && way.geometry.coordinates.length === way.properties.refs.length) {
      // getting covering tiles and neighbors
      var coverQuadkeys = getCoveringQuadkeys(way, zoomLevel);
      var neighborhoodQuadkeys = getNeighborhoodQuadkeys(coverQuadkeys);
      // indexing way in its covering tiles and neighbors
      indexWay(way, neighborhoodQuadkeys, quadHash);
    }

  }).on('end', function () {
    callback(null, quadHash);
  });
}

function normalizeWays(ways, tile) {
  var quadkey = tilebelt.tileToQuadkey(tile);
  var zoomLevel = tile[2];
  ways = splitWays(ways);
  ways = mergeWays(ways);
  ways = selectTileWays(quadkey, ways, zoomLevel);
  return ways;
}
