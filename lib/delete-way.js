'use strict';

module.exports = function (graph, way) {
  var intersections = way.properties.refs;
  var wayId = way.properties.id;

  delete graph.ways[wayId];
  intersections.forEach(function (id) {
    var intersection = graph.intersections[id];
    if (intersection !== undefined) {
      intersection.properties.ways = intersection.properties.ways.filter(function (elem) {
        return elem !== wayId;
      });
    }
  });
};
