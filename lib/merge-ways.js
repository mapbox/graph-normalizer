'use strict';

var clone = require('./clone');
var coordsInArray = require('./coords-in-array');

/**
 * Merges two ways separated by a node
 * @param {Object} wayA GeoJSON LineString that should originate the fusion
 * @param  {Float} node the reference id for the intersection
 * @param {Object} wayB GeoJSON LineString that should end the fusion
 * @return {Object} way GeoJSON LineString representing the fusionned way
 */
module.exports = function (wayA, node, wayB) {
  // Verifying that ways are on the same way-number
  if (wayA.properties.oneway !== wayB.properties.oneway) return undefined;
  if (wayA.properties.refs.indexOf(node) === -1 || wayB.properties.refs.indexOf(node) === -1) return undefined;

  var orgWay = {};
  var endWay = {};

  if (coordsInArray(wayB.geometry.coordinates[0], wayA.geometry.coordinates) === wayA.properties.refs.length - 1) {
    orgWay = wayA;
    endWay = wayB;
  } else if (coordsInArray(wayA.geometry.coordinates[0], wayB.geometry.coordinates) === wayB.properties.refs.length - 1) {
    orgWay = wayB;
    endWay = wayA;
  } else {
    return undefined;
  }

  var mergedWay = clone(orgWay);

  // Modifying id
  mergedWay.properties.id = orgWay.properties.id + '!M!' + endWay.properties.id;

  // Merging coordinates and references
  mergedWay.geometry.coordinates.pop();
  mergedWay.geometry.coordinates = mergedWay.geometry.coordinates.concat(endWay.geometry.coordinates);

  // Merging refs
  mergedWay.properties.refs.pop();
  mergedWay.properties.refs = mergedWay.properties.refs.concat(endWay.properties.refs);

  return mergedWay;
};
