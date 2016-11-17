'use strict';

var cover = require('tile-cover');

module.exports = function (quadkey, ways, zoomLevel) {
  var keepWays = [];

  zoomLevel = zoomLevel || 14;

  for (var i = 0; i < ways.length; i++) {
    var way = ways[i];

    // index the pair with a set of quadkeys
    var quadkeys = cover.indexes({type: 'LineString', coordinates: way.geometry.coordinates}, {
      'min_zoom': zoomLevel,
      'max_zoom': zoomLevel
    });

    for (var j = 0; j < quadkeys.length; j++) {
      if (quadkey === quadkeys[j]) {
        keepWays.push(way);
        break;
      }
    }
  }
  return keepWays;
};
