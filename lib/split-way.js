'use strict';

var clone = require('./clone');
var coordsInArray = require('./coords-in-array');

/**
 * Detects ways that continue through an intersection and splits them in two.
 * @param  {Object} way GeoJSON LineString representing an edge of connected to an intersection
 * @param  {Float} node the reference id for the intersection
 * @param {Array} nodeGeom an array of coordinates in [lng, lat] corresponding to the node's geometry.
 * @return {Array} splitWays 2d array of ways representing a split version of the input array
 */
module.exports = function (way, intersection) {
  // refs must be an array and not strings
  // see create-intersection-hash
  var refs = way.properties.refs;
  var coordinates = way.geometry.coordinates;

  var coordsIndex = coordsInArray(intersection.geometry.coordinates, coordinates, 1);
  // do not split at the last point.
  if (coordsIndex === (coordinates.length - 1)) coordsIndex = -1;
  // If the way geometry starts with the intersection, only look in the refs from index 1.
  var searchIndex = coordsInArray(intersection.geometry.coordinates, coordinates) === 0 ? 1 : 0;
  var refsIndex = refs.indexOf(intersection.properties.id.toString(), searchIndex);

  if (refsIndex === -1 || coordsIndex === -1) {
    return [];
  } else {
    var splitWays = [];
    var wayA = clone(way);
    var wayB = clone(way);
    wayA.properties.id += '!A';
    wayB.properties.id += '!B';
    wayA.properties.refs = wayA.properties.refs.slice(0, refsIndex + 1);
    wayB.properties.refs = wayB.properties.refs.slice(refsIndex, refs.length);
    wayA.geometry.coordinates = wayA.geometry.coordinates.slice(0, coordsIndex + 1);
    wayB.geometry.coordinates = wayB.geometry.coordinates.slice(coordsIndex, coordinates.length);

    splitWays.push(wayA);
    splitWays.push(wayB);

    return splitWays;
  }
};
