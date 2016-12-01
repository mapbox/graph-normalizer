'use strict';

var cover = require('tile-cover');
var lineString = require('turf-linestring');

module.exports = function (way, zoomLevel) {
  // wont crop ways with only two nodes
  if (way.properties.refs.length < 3) return [way];

  var ways = [];
  var last = 0;
  var splits = 0;

  // looking for quadkeys of each node
  var quadkeys = [];
  for (var j = 0; j < way.properties.refs.length; j++) {
    var quadkey = cover.indexes({type: 'Point', coordinates: way.geometry.coordinates[j]}, {
      'min_zoom': zoomLevel,
      'max_zoom': zoomLevel
    })[0];
    quadkeys.push(quadkey);
  }

  for (var i = 0; i < way.properties.refs.length - 1; i++) {
    var current = i + 1;

    var waySlice = null;

    // last iteration
    if (current === way.properties.refs.length - 1) {
      // add front of split way to splitWays
      waySlice = lineString(
        way.geometry.coordinates.slice(last, current + 1),
        {
          id: way.properties.id + '!' + splits,
          refs: way.properties.refs.slice(last, current + 1)
        }
      );

      // persist oneway and highway tags if they are present
      if (way.properties.hasOwnProperty('oneway')) waySlice.properties.oneway = way.properties.oneway;
      if (way.properties.hasOwnProperty('highway')) waySlice.properties.highway = way.properties.highway;

      ways.push(waySlice);
      continue;
    }

    // looking at changes in the quadkey sequence
    var prevQuad = quadkeys[i];
    var currQuad = quadkeys[i + 1];
    var nextQuad = quadkeys[i + 2];

    // split condition
    if ((prevQuad === nextQuad) && (currQuad !== prevQuad)) {
      // add front of split way to splitWays
      waySlice = lineString(
        way.geometry.coordinates.slice(last, current + 1),
        {
          id: way.properties.id + '!' + splits,
          refs: way.properties.refs.slice(last, current + 1)
        }
      );

      // persist oneway and highway tags if they are present
      if (way.properties.hasOwnProperty('oneway')) waySlice.properties.oneway = way.properties.oneway;
      if (way.properties.hasOwnProperty('highway')) waySlice.properties.highway = way.properties.highway;

      ways.push(waySlice);

      splits += 1;
      last = current;
    }
  }

  return ways;
};
