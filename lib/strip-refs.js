'use strict';

var coordsInArray = require('./coords-in-array');

module.exports = function (graph, way) {
  way.properties.refs = way.properties.refs.filter(function (id) {
    if (graph.intersections[id] === undefined) {
      return false;
    } else {
      var coords = graph.intersections[id].geometry.coordinates;
      return coordsInArray(coords, way.geometry.coordinates) > -1;
    }
  });
  way.properties.rawRefs = way.properties.rawRefs.filter(function (id) {
    var coords = graph.nodes[id].geometry.coordinates;
    return coordsInArray(coords, way.geometry.coordinates) > -1;
  });
};
