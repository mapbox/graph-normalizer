'use strict';

var mergeWays = require('./merge-ways');
var deleteWay = require('./delete-way');
var addWay = require('./add-way');

/**
 * Merge ways at 2-degree intersections.
 * @param {Object} graph A graph object with 'intersections' and 'ways' keys.
 */
module.exports = function (graph) {
  var intersections = graph.intersections;
  Object.keys(intersections).forEach(function (id) {
    if (intersections[id].properties.ways.length === 2) {
      // go fetch the ways from their ids.
      var ways = [
        graph.ways[intersections[id].properties.ways[0]],
        graph.ways[intersections[id].properties.ways[1]]
      ];
      var mergedWay = mergeWays(ways[0], id, ways[1]);
      if (mergedWay === undefined) return;
      else {
        addWay(graph, mergedWay);
        deleteWay(graph, ways[0]);
        deleteWay(graph, ways[1]);
        delete intersections[id];
      }
    }
  });
};
