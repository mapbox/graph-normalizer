'use strict';

var lineString = require('turf-linestring');

/**
 * Given ways, split any ways that cross over an intersections
 * @param  {Object} ways  an array of ways
 * @param  {Object} options  an options object defining mergeHighways, mergeTunnels, and mergeBridges (all default to false)
 * @return {Object} ways another array of ways
 */
module.exports = function (wayList, options) {
  // default options
  if (!options) options = {};
  options.mergeHighways = (options.mergeHighways === undefined) ? false : options.mergeHighways;
  options.mergeTunnels = (options.mergeTunnels === undefined) ? false : options.mergeTunnels;
  options.mergeBridges = (options.mergeBridges === undefined) ? false : options.mergeBridges;
  options.mergeJunctions = (options.mergeJunctions === undefined) ? false : options.mergeJunctions;

  // build node and way hashes
  var nodes = new Map();
  var ways = {};

  wayList.forEach(function (way) {
    // normalize oneways to always equal 0 (bidirectional) or 1 (oneway in direction of coords)
    if (way.properties.oneway === -1) {
      way.properties.oneway = 1;
      way.properties.refs = way.properties.refs.reverse();
      way.geometry.coordinates = way.geometry.coordinates.reverse();
    }

    ways[way.properties.id] = way;
    way.properties.refs.forEach(function (ref) {
      if (!nodes.has(ref)) nodes.set(ref, new Set());

      nodes.get(ref).add(way.properties.id);
    });
  });

  // build merge queue
  nodes.forEach(function (ownerIds, node) {
    // delete nodes that do not have exactly 2 owners
    // nodes with < 2 owners are non terminal nodeHash
    // nodes with > 2 oweners are intersections
    if (ownerIds.size !== 2) nodes.delete(node);
  });

  // filter merges with mismatched highway or oneway tags
  nodes.forEach(function (ownerIds, node) {
    var owners = [];
    ownerIds.forEach(function (id) {
      owners.push(ways[id]);
    });

    if (
      (
        owners[0].properties.oneway !==
        owners[1].properties.oneway
      ) ||
      (
        (!options.mergeHighways) &&
        (
          owners[0].properties.highway !==
          owners[1].properties.highway
        )
      ) ||
      (
        (!options.mergeBridges) &&
        (
          owners[0].properties.bridge !==
          owners[1].properties.bridge
        )
      ) ||
      (
        (!options.mergeTunnels) &&
        (
          owners[0].properties.tunnel !==
          owners[1].properties.tunnel
        )
      ) ||
      (
        (!options.mergeJunctions) &&
        (
          owners[0].properties.junction !==
          owners[1].properties.junction
        )
      )
    ) nodes.delete(node);
  });

  // keep merging until all merge nodes have been eliminated
  while (nodes.size) {
    var nodeIterator = nodes.keys();
    var nodeId = nodeIterator.next().value;
    var node = nodes.get(nodeId);

    var owners = [];

    node.forEach(function (id) {
      owners.push(ways[id]);
    });

    var opening = null;
    var closing = null;
    var validMerge = true;

    // if owners < 2, this way cannot be merged due to an edge case
    if (owners.filter(function (owner) { return owner; }).length === 2) {
      if (owners[0].properties.oneway === 1) {
        // oneway merge
        // assign opening and closing way
        owners.forEach(function (owner) {
          if (owner.properties.refs[owner.properties.refs.length - 1] === nodeId) {
            opening = owner;
          } else if (owner.properties.refs[0] === nodeId) {
            closing = owner;
          }
        });
        // if an opening and closing way were not found,
        // the ways do not face the same direction
        if (!opening || !closing) validMerge = false;
      } else {
        // bidirectional merge

        // We order the ways in order of ids to ensure ID consistency.
        if (owners[0].properties.id < owners[1].properties.id) {
          opening = owners[0];
          closing = owners[1];
        } else {
          opening = owners[1];
          closing = owners[0];
        }

        // if opening and closing are not present for a bidirectional...
        // most likely one of the ways loops in on itself in an odd way
        if (!opening || !closing) validMerge = false;
        else {
          // flip bidirectional ways if they are not oriented correctly
          if (opening.properties.refs[opening.properties.refs.length - 1] !== nodeId) {
            opening.properties.refs = opening.properties.refs.reverse();
            opening.geometry.coordinates = opening.geometry.coordinates.reverse();
          }

          if (closing.properties.refs[0] !== nodeId) {
            closing.properties.refs = closing.properties.refs.reverse();
            closing.geometry.coordinates = closing.geometry.coordinates.reverse();
          }
        }
      }
    } else validMerge = false;

    if (validMerge) {
      // combine the opening way with the closing way
      // omit the first ref of the closing way to avoid repeating the shared node
      var combined = lineString(
        opening.geometry.coordinates.concat(closing.geometry.coordinates.slice(1, closing.geometry.coordinates.length)),
        {
          id: opening.properties.id + ',' + closing.properties.id,
          refs: opening.properties.refs.concat(closing.properties.refs.slice(1, closing.properties.refs.length))
        }
      );

      // persist oneway, highway, bridge, tunnel, and junction tags if they are present
      if (opening.properties.hasOwnProperty('oneway')) combined.properties.oneway = opening.properties.oneway;

      if (options.mergeHighways) {
        // if highway tags are the same, keep them, else set as unclassified
        if (opening.properties.hasOwnProperty('highway') && closing.properties.hasOwnProperty('highway') && (opening.properties.highway === closing.properties.highway)) {
          combined.properties.highway = opening.properties.highway;
        } else {
          combined.properties.highway = 'unclassified';
        }
      } else if (opening.properties.hasOwnProperty('highway')) combined.properties.highway = opening.properties.highway;

      if (options.mergeBridges) {
        if (opening.properties.hasOwnProperty('bridge')) combined.properties.bridge = opening.properties.bridge;
        else if (closing.properties.hasOwnProperty('bridge')) combined.properties.bridge = closing.properties.bridge;
      } else if (opening.properties.hasOwnProperty('bridge')) combined.properties.bridge = opening.properties.bridge;

      if (options.mergeTunnels) {
        if (opening.properties.hasOwnProperty('tunnel')) combined.properties.tunnel = opening.properties.tunnel;
        else if (closing.properties.hasOwnProperty('tunnel')) combined.properties.tunnel = closing.properties.tunnel;
      } else if (opening.properties.hasOwnProperty('tunnel')) combined.properties.bridge = opening.properties.bridge;

      if (options.mergeJunctions) {
        if (opening.properties.hasOwnProperty('junction')) combined.properties.junction = opening.properties.junction;
        else if (closing.properties.hasOwnProperty('junction')) combined.properties.junction = closing.properties.junction;
      } else if (opening.properties.hasOwnProperty('junction')) combined.properties.junction = opening.properties.junction;

      // insert combined way into hash
      ways[combined.properties.id] = combined;

      // update terminal nodes of combined way
      // patch starting node
      if (nodes.has(combined.properties.refs[0])) {
        var starting = nodes.get(combined.properties.refs[0]);
        starting.delete(opening.properties.id);
        starting.delete(closing.properties.id);
        starting.add(combined.properties.id);
      }

      // patch ending node
      if (nodes.has(combined.properties.refs[combined.properties.refs.length - 1])) {
        var ending = nodes.get(combined.properties.refs[combined.properties.refs.length - 1]);
        ending.delete(opening.properties.id);
        ending.delete(closing.properties.id);
        ending.add(combined.properties.id);
      }

      // delete merged ways from hash
      delete ways[opening.properties.id];
      delete ways[closing.properties.id];
    }
    // delete merged node from heap
    nodes.delete(nodeId);
  }

  var merged = Object.keys(ways).map(function (id) {
    return ways[id];
  });

  return merged;
};
