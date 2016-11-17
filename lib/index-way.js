'use strict';

var cover = require('tile-cover');
var tilebelt = require('tilebelt');

module.exports = function (way, zoomLevel) {
  var tileQuadkeys = {};
  zoomLevel = zoomLevel || 14;

  var coverQuadkeys = cover.indexes({type: 'LineString', coordinates: way.geometry.coordinates}, {
    'min_zoom': zoomLevel,
    'max_zoom': zoomLevel
  });

  var quadkeys = {};
  // getting the set of neighboring quadkeys
  for (var k = 0; k < coverQuadkeys.length; k++) {
    var coverQuadkey = coverQuadkeys[k];
    var coverTile = tilebelt.quadkeyToTile(coverQuadkey);
    for (var l = -1; l < 2; l++) {
      for (var m = -1; m < 2; m++) {
        quadkeys[tilebelt.tileToQuadkey([coverTile[0] + l, coverTile[1] + m, coverTile[2]])] = 1;
      }
    }
  }

  // push the pair to each quadkey's array that it touches
  Object.keys(quadkeys).forEach(function (quadkey) {
    if (!tileQuadkeys[quadkey]) tileQuadkeys[quadkey] = [];
    tileQuadkeys[quadkey].push(way);
  });

  return tileQuadkeys;
};
