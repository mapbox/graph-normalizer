'use strict';

module.exports = function (graph, way) {
  var intersections = way.properties.refs;
  var wayId = way.properties.id;

  graph.ways[wayId] = way;
  intersections.forEach(function (id) {
    var intersection = graph.intersections[id];
    if (intersection !== undefined) {
      intersection.properties.ways.push(wayId);
    }
  });
};
