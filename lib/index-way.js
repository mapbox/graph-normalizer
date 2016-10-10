'use strict';

var cover = require('tile-cover');

module.exports = function (way, zoomLevel) {
  var tileQuadkeys = {};
  zoomLevel = zoomLevel || 14;
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
};
