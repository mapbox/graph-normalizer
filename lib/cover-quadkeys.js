'use strict';

var cover = require('tile-cover');

module.exports = function (way, zoomLevel) {
  zoomLevel = zoomLevel || 14;

  var coverQuadkeys = cover.indexes({type: 'LineString', coordinates: way.geometry.coordinates}, {
    'min_zoom': zoomLevel,
    'max_zoom': zoomLevel
  });

  return coverQuadkeys;
};
