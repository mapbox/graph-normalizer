'use strict';

var splitWay = require('./split-way');
var deleteWay = require('./delete-way');
var addWay = require('./add-way');
var stripRefs = require('./strip-refs');
var coordsInArray = require('./coords-in-array');
/**
 * Splits all ways that do not end at an intersection
 * @param {Object} graph object with an 'intersections' and a 'ways' keys
 */
module.exports = function (graph) {
  var intersections = graph.intersections;
  var ways = graph.ways;
  Object.keys(intersections).forEach(function (id) {
    var replacements = [];
    // Compute all the replacements that need to occur for this intersection
    for (var k = 0, n = intersections[id].properties.ways.length; k < n; k++) {
      var way = ways[intersections[id].properties.ways[k]];
      var index = coordsInArray(intersections[id].geometry.coordinates, way.geometry.coordinates, 0);
      var second = (index > -1) ? coordsInArray(intersections[id].geometry.coordinates, way.geometry.coordinates, index + 1) : -1;

      // If the way holds the intersection out of its boundaries, split it.
      if (index > 0 && index < (way.geometry.coordinates.length - 1) && second === -1) {
        replacements.push({
          oldWay: way,
          newWays: splitWay(way, intersections[id])
        });
      }
    }
    // Perform all replacements
    for (var i = 0, m = replacements.length; i < m; i++) {
      var oldWay = replacements[i].oldWay;
      var newWays = replacements[i].newWays;
      if (newWays.length === 2) {
        stripRefs(graph, newWays[0]);
        stripRefs(graph, newWays[1]);
        deleteWay(graph, oldWay);
        addWay(graph, newWays[0]);
        addWay(graph, newWays[1]);
      } else {
        throw new Error('Could not split a way. ' + oldWay.properties.id);
      }
    }
  });
};
