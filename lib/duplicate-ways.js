'use strict';

var clone = require('./clone');

module.exports = function (graph) {
  var ways = graph.ways;
  var intersections = graph.intersections;
  Object.keys(ways).forEach(function (wayId) {
    var way = ways[wayId];
    if (way.properties.oneway === 0) {
      var duplicate = clone(way);
      duplicate.properties.refs.reverse();
      duplicate.geometry.coordinates.reverse();
      duplicate.properties.id = way.properties.id + '!R';
      ways[duplicate.properties.id] = duplicate;
      way.properties.oneway = 1;
      duplicate.properties.oneway = 1;
      for (var i = 0, n = duplicate.properties.refs.length; i < n; i++) {
        var ref = duplicate.properties.refs[i];
        if (intersections[ref] !== undefined) {
          intersections[ref].properties.ways.push(duplicate.properties.id);
        }
      }
    }
  });
};
