'use strict';

var clone = require('./clone');

module.exports = unidirectionalWays;


/**
 * Given ways with a oneway property, return ways with 'f' or 'r'
 * prepended to their ids, duplicating two directional ways.
 * @param  {Object} ways  an array of ways
 * @return {Object} ways another array of ways
 */
function unidirectionalWays(ways) {
  var resultWays = [];
  for (var i = 0, n = ways.length; i < n; i++) {
    var way = ways[i];
    if (way.properties.oneway === 0) {
      way.properties.oneway = 1;
      var reverseWay = clone(way);
      reverseWay.geometry.coordinates.reverse();
      reverseWay.properties.refs.reverse();
      reverseWay.properties.id = 'r' + reverseWay.properties.id;
      resultWays.push(reverseWay);
    }
    way.properties.id = 'f' + way.properties.id;
    resultWays.push(way);
  }
  return resultWays;
}
