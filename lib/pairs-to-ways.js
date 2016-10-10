'use strict';

var lineString = require('turf-linestring');

module.exports = function (pairs) {
  // given an array of pairs, return an array of LineString ways.
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
};
