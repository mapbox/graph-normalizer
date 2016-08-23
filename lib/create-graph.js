'use strict';

var tb = require('tilebelt');
var coordsInArray = require('./coords-in-array');

/**
 * Only keep references to nodes whose geometry is in the way's geometry.
 * @param {Array} nodes An array of nodes.
 * @param {Array} ways An array of ways.
 * @param {Array} tile Tile coordinates.
 */

module.exports = createGraph;
module.exports.nodesToIntersections = nodesToIntersections;
module.exports.splitIfBroken = splitIfBroken;
module.exports.processWay = processWay;

function createGraph(nodes, ways, tile) {
  var intersections = nodesToIntersections(nodes, tile);
  var newWays = {};
  var splitWays = [];
  for (var i = 0, n = ways.length; i < n; i++) {
    var way = ways[i];
    if (tile !== undefined) {
      way.properties.id = tile.join('/') + '!' +  way.properties.id;
    }
    // Turn the string of refs into an array.
    if (typeof way.properties.refs === 'string') {
      way.properties.refs = way.properties.refs.split(',');
    }
    // Split MultiLineString ways.
    splitWays = splitWays.concat(splitIfBroken(way));
    // Populate the intersections hash and strip the way's refs.
  }
  splitWays.forEach(processWay(intersections, newWays));
  // Remove intersections with only one way (intermediary nodes).
  Object.keys(intersections).forEach(function (id) {
    if (intersections[id].properties.ways.length < 2) delete intersections[id];
  });
  var graph = {
    ways: newWays,
    intersections: intersections
  };
  return graph;
}

function nodesToIntersections(nodes, tile) {
  // Build the intersections hash.
  // An intersection's ways attribute is an array of way ids.
  var intersections = {};
  // construct intersection hash

  for (var i = 0, n = nodes.length; i < n; i++) {
    // if the node doesn't belong in this tile,
    // and is in the buffer, don't put it into the hash
    if (tile !== undefined) {
      var nodetile = tb.pointToTile(nodes[i].geometry.coordinates[0], nodes[i].geometry.coordinates[1], tile[2]);
      if ((nodetile[0] !== tile[0]) || (nodetile[1] !== tile[1])) continue;
    }
    nodes[i].properties.ways = [];
    nodes[i].properties.id = nodes[i].properties.id.toString();
    intersections[nodes[i].properties.id] = nodes[i];
  }
  return intersections;
}

function splitIfBroken(way) {
  // If a way has a MultiLineString geometry, split into its parts and append
  // to its id.
  var splitWays = [];
  if (way.geometry.type === 'LineString') {
    splitWays = [way];
  } else if (way.geometry.type === 'MultiLineString') {
    for (var i = 0, n = way.geometry.coordinates.length; i < n; i++) {
      var splitWayId = way.properties.id + '!' + i;
      var splitWay = {
        type: 'Feature',
        properties: {
          id: splitWayId,
          refs: way.properties.refs.slice(),
          oneway: way.properties.oneway
        },
        geometry: {
          type: 'LineString',
          coordinates: way.geometry.coordinates[i]
        }
      };
      splitWays.push(splitWay);
    }
  }
  return splitWays;
}

function processWay(intersections, ways) {
  // Strip references to nodes that are not part of the way's geometry
  // and add it to the its intersections hash, and the ways hash.
  return function (way) {
    var i = way.properties.refs.length;
    while (i--) {
      var ref = way.properties.refs[i];
      if (intersections[ref] === undefined ||
          coordsInArray(intersections[ref].geometry.coordinates, way.geometry.coordinates) === -1) {
        way.properties.refs.splice(i, 1);
      } else {
        intersections[ref].properties.ways.push(way.properties.id);
      }
    }
    ways[way.properties.id] = way;
  };
}
