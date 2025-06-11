

const lineString = require('turf-linestring');

module.exports = function (wayList, options) {
    // default options
    if (!options) options = {};
    options.mergeHighways = (options.mergeHighways === undefined) ? false : options.mergeHighways;
    options.mergeTunnels = (options.mergeTunnels === undefined) ? false : options.mergeTunnels;
    options.mergeBridges = (options.mergeBridges === undefined) ? false : options.mergeBridges;
    options.mergeMaxspeed = (options.mergeMaxspeed === undefined) ? false : options.mergeMaxspeed;

    // build node and way hashes
    const nodes = new Map();
    const ways = {};

    wayList.forEach((way) => {
    // normalize oneways to always equal 0 (bidirectional) or 1 (oneway in direction of coords)
        if (way.properties.oneway === -1) {
            way.properties.oneway = 1;
            way.properties.refs = way.properties.refs.reverse();
            way.geometry.coordinates = way.geometry.coordinates.reverse();
        }

        ways[way.properties.id] = way;
        way.properties.refs.forEach((ref) => {
            if (!nodes.has(ref)) nodes.set(ref, new Set());

            nodes.get(ref).add(way.properties.id);
        });
    });

    // build merge queue
    nodes.forEach((ownerIds, node) => {
    // delete nodes that do not have exactly 2 owners
    // nodes with < 2 owners are non terminal nodeHash
    // nodes with > 2 oweners are intersections
        if (ownerIds.size !== 2) nodes.delete(node);
    });

    // filter merges with mismatched highway or oneway tags
    nodes.forEach((ownerIds, node) => {
        const owners = [];
        ownerIds.forEach((id) => {
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
          (!options.mergeMaxspeed) &&
        (
            owners[0].properties.maxspeed !==
          owners[1].properties.maxspeed
        )
      )
        ) nodes.delete(node);
    });

    // keep merging until all merge nodes have been eliminated
    while (nodes.size) {
        const nodeIterator = nodes.keys();
        const nodeId = nodeIterator.next().value;
        const node = nodes.get(nodeId);

        const owners = [];

        node.forEach((id) => {
            owners.push(ways[id]);
        });

        let opening = null;
        let closing = null;
        let validMerge = true;

        // if owners < 2, this way cannot be merged due to an edge case
        if (owners.filter(owner => owner).length === 2) {
            if (owners[0].properties.oneway === 1) {
                // oneway merge
                // assign opening and closing way
                owners.forEach((owner) => {
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
            const combined = lineString(
                opening.geometry.coordinates.concat(closing.geometry.coordinates.slice(1, closing.geometry.coordinates.length)),
                {
                    id: `${opening.properties.id  },${  closing.properties.id}`,
                    refs: opening.properties.refs.concat(closing.properties.refs.slice(1, closing.properties.refs.length))
                }
            );

            // persist oneway, highway, bridge, tunnel and maxspeed tags if they are present
            if (Object.hasOwn(opening, 'oneway')) combined.properties.oneway = opening.properties.oneway;

            if (options.mergeHighways) {
                // if highway tags are the same, keep them, else set as unclassified
                if (Object.hasOwn(opening, 'highway') && Object.hasOwn(closing, 'highway') && (opening.properties.highway === closing.properties.highway)) {
                    combined.properties.highway = opening.properties.highway;
                } else {
                    combined.properties.highway = 'unclassified';
                }
            } else if (Object.hasOwn(opening, 'highway')) combined.properties.highway = opening.properties.highway;

            if (options.mergeBridges) {
                if (Object.hasOwn(opening, 'bridge')) combined.properties.bridge = opening.properties.bridge;
                else if (Object.hasOwn(closing, 'bridge')) combined.properties.bridge = closing.properties.bridge;
            } else if (Object.hasOwn(opening, 'bridge')) combined.properties.bridge = opening.properties.bridge;

            if (options.mergeTunnels) {
                if (Object.hasOwn(opening, 'tunnel')) combined.properties.tunnel = opening.properties.tunnel;
                else if (Object.hasOwn(closing, 'tunnel')) combined.properties.tunnel = closing.properties.tunnel;
            } else if (Object.hasOwn(opening, 'tunnel')) combined.properties.bridge = opening.properties.bridge;

            if (options.mergeMaxspeed) {
                // if maxspeed tags are the same, keep them, else set as min
                if (Object.hasOwn(opening, 'maxspeed') && Object.hasOwn(closing, 'maxspeed')) {
                    if (opening.properties.maxspeed === closing.properties.maxspeed) {
                        combined.properties.maxspeed = opening.properties.maxspeed;
                    } else {
                        combined.properties.maxspeed = Math.min(opening.properties.maxspeed, closing.properties.maxspeed);
                    }
                } else if (Object.hasOwn(opening, 'maxspeed')) {
                    combined.properties.maxspeed = opening.properties.maxspeed;
                } else combined.properties.maxspeed = closing.properties.maxspeed;
            } else if (Object.hasOwn(opening, 'maxspeed')) combined.properties.maxspeed = opening.properties.maxspeed;

            // insert combined way into hash
            ways[combined.properties.id] = combined;

            // update terminal nodes of combined way
            // patch starting node
            if (nodes.has(combined.properties.refs[0])) {
                const starting = nodes.get(combined.properties.refs[0]);
                starting.delete(opening.properties.id);
                starting.delete(closing.properties.id);
                starting.add(combined.properties.id);
            }

            // patch ending node
            if (nodes.has(combined.properties.refs[combined.properties.refs.length - 1])) {
                const ending = nodes.get(combined.properties.refs[combined.properties.refs.length - 1]);
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

    const merged = Object.keys(ways).map(id => ways[id]);

    return merged;
};
