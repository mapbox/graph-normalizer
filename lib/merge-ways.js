'use strict';

var lineString = require('turf-linestring');

module.exports = function (wayList) {
  // build node and way hashes
  var nodes = {};
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
      if (!nodes[ref]) nodes[ref] = {};

      nodes[ref][way.properties.id] = true;
    });
  });

  // build merge queue
  Object.keys(nodes).forEach(function (node) {
    var owners = Object.keys(nodes[node]).map(function (id) {
      return ways[id];
    });

    // delete nodes that do not have exactly 2 owners
    // nodes with < 2 owners are non terminal nodeHash
    // nodes with > 2 oweners are intersections
    if (owners.length !== 2) delete nodes[node];
  });

  // filter merges with mismatched highway or oneway tags
  Object.keys(nodes).forEach(function (node) {
    var owners = Object.keys(nodes[node]).map(function (id) {
      return ways[id];
    });

    if (
      (
        owners[0].properties.highway !==
        owners[1].properties.highway
      ) ||
      (
        owners[0].properties.oneway !==
        owners[1].properties.oneway
      )
    ) delete nodes[node];
  });

  // keep merging until all merge nodes have been eliminated
  while (Object.keys(nodes).length) {
    var node = Object.keys(nodes)[0];
    var owners = Object.keys(nodes[node]).map(function (id) {
      return ways[id];
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
          if (owner.properties.refs[owner.properties.refs.length - 1] === node) {
            opening = owner;
          } else if (owner.properties.refs[0] === node) {
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
          if (opening.properties.refs[opening.properties.refs.length - 1] !== node) {
            opening.properties.refs = opening.properties.refs.reverse();
            opening.geometry.coordinates = opening.geometry.coordinates.reverse();
          }

          if (closing.properties.refs[0] !== node) {
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

      // persist oneway and highway tags if they are present
      if (opening.properties.hasOwnProperty('oneway')) combined.properties.oneway = opening.properties.oneway;
      if (opening.properties.hasOwnProperty('highway')) combined.properties.highway = opening.properties.highway;

      // insert combined way into hash
      ways[combined.properties.id] = combined;

      // update terminal nodes of combined way
      // patch starting node
      if (nodes[combined.properties.refs[0]]) {
        delete nodes[combined.properties.refs[0]][opening.properties.id];
        delete nodes[combined.properties.refs[0]][closing.properties.id];
        nodes[combined.properties.refs[0]][combined.properties.id] = true;
      }

      // patch ending node
      if (nodes[combined.properties.refs[combined.properties.refs.length - 1]]) {
        delete nodes[combined.properties.refs[combined.properties.refs.length - 1]][opening.properties.id];
        delete nodes[combined.properties.refs[combined.properties.refs.length - 1]][closing.properties.id];
        nodes[combined.properties.refs[combined.properties.refs.length - 1]][combined.properties.id] = true;
      }

      // delete merged ways from hash
      delete ways[opening.properties.id];
      delete ways[closing.properties.id];
    }
    // delete merged node from heap
    delete nodes[node];
  }

  var merged = Object.keys(ways).map(function (id) {
    return ways[id];
  });

  return merged;
};
