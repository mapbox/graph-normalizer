

const lineString = require('turf-linestring');

/**
 * Given ways, split any ways that cross over an intersections
 * @param  {Object} ways  an array of ways
 * @return {Object} ways another array of ways
 */
module.exports = function (ways) {
    // construct node hash
    // nodeHash is a hash of nodes => ways
    // each way represents a node "owner"
    const nodeHash = {};
    ways.forEach((way) => {
        way.properties.refs.forEach((ref) => {
            if (!nodeHash[ref]) nodeHash[ref] = 0;

            nodeHash[ref] += 1;
        });
    });

    const splitWays = [];

    ways.forEach((way) => {
        let splits = 0;
        let last = 0;
        let current = 0;

        way.properties.refs.forEach((ref, i) => {
            current++;

            // ignore terminal nodes
            if (i > 0 && i < way.properties.refs.length - 1) {
                // find the number of ways that contain the node
                const ownerCount = nodeHash[ref];

                // look for nodes with more than 1 owner
                if (ownerCount > 1) {
                    // add front of split way to splitWays
                    const waySlice = lineString(
                        way.geometry.coordinates.slice(last, current),
                        {
                            id: `${way.properties.id  }!${  splits}`,
                            refs: way.properties.refs.slice(last, current)
                        }
                    );

                    // persist these tags if they are present:
                    if (Object.hasOwn(way, 'oneway')) waySlice.properties.oneway = way.properties.oneway;
                    if (Object.hasOwn(way, 'highway')) waySlice.properties.highway = way.properties.highway;
                    if (Object.hasOwn(way, 'bridge')) waySlice.properties.bridge = way.properties.bridge;
                    if (Object.hasOwn(way, 'tunnel')) waySlice.properties.tunnel = way.properties.tunnel;
                    if (Object.hasOwn(way, 'name')) waySlice.properties.name = way.properties.name;
                    if (Object.hasOwn(way, 'ref')) waySlice.properties.ref = way.properties.ref;
                    if (Object.hasOwn(way, 'access')) waySlice.properties.access = way.properties.access;
                    if (Object.hasOwn(way, 'junction')) waySlice.properties.junction = way.properties.junction;

                    splitWays.push(waySlice);

                    splits++;
                    last = i;
                }
            }
        });

        // add the remainder of the way
        if (last < current) {
            const waySlice = lineString(
                way.geometry.coordinates.slice(last, current),
                {
                    id: `${way.properties.id  }!${  splits}`,
                    refs: way.properties.refs.slice(last, current)
                }
            );

            // persist these tags if they are present:
            if (Object.hasOwn(way, 'oneway')) waySlice.properties.oneway = way.properties.oneway;
            if (Object.hasOwn(way, 'highway')) waySlice.properties.highway = way.properties.highway;
            if (Object.hasOwn(way, 'bridge')) waySlice.properties.bridge = way.properties.bridge;
            if (Object.hasOwn(way, 'tunnel')) waySlice.properties.tunnel = way.properties.tunnel;
            if (Object.hasOwn(way, 'name')) waySlice.properties.name = way.properties.name;
            if (Object.hasOwn(way, 'ref')) waySlice.properties.ref = way.properties.ref;
            if (Object.hasOwn(way, 'access')) waySlice.properties.access = way.properties.access;
            if (Object.hasOwn(way, 'junction')) waySlice.properties.junction = way.properties.junction;

            splitWays.push(waySlice);
        }
    });

    return splitWays;
};
