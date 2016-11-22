'use strict';

var lineString = require('turf-linestring');

module.exports = function (ways) {
  var segmentHash = {};
  var wayHash = {};

  // Building hash
  for (var i = 0; i < ways.length; i++) {
    var way = ways[i];
    wayHash[way.properties.id] = way;

    var orgSegment = String(way.properties.refs.slice(0, 2));
    var endSegment = String(way.properties.refs.slice(way.properties.refs.length - 2, way.properties.refs.length));

    // if (way.properties.id === '10474493|0!0') {
    //   console.log(way);
    //   console.log(orgSegment);
    //   console.log(endSegment);
    // }

    // if hash not defined, define it
    if (!segmentHash[orgSegment]) {
      segmentHash[orgSegment] = {};
      segmentHash[orgSegment]['pair'] = [undefined, undefined];
    }
    if (!segmentHash[endSegment]) {
      segmentHash[endSegment] = {};
      segmentHash[endSegment]['pair'] = [undefined, undefined];
    }

    // Adding id to the hash
    segmentHash[orgSegment][way.properties.id] = true;
    segmentHash[endSegment][way.properties.id] = true;

    // setting order for merging
    // if (way.properties.id === "10474493|1!0") {
    //   console.log(segmentHash[endSegment]);
    // }
    if (way.properties.refs.length == 2) {
      // dealing with ways with only one segment
      // avoid to overwrite ontop of bigger ways
      if (segmentHash[endSegment]['pair'][0] === undefined) segmentHash[endSegment]['pair'][0] = way.properties.id;
      if (segmentHash[orgSegment]['pair'][1] === undefined) segmentHash[orgSegment]['pair'][1] = way.properties.id;
    } else {
      segmentHash[endSegment]['pair'][0] = way.properties.id;
      segmentHash[orgSegment]['pair'][1] = way.properties.id;
    }
  }

  // build merge queue
  var segmentList = Object.keys(segmentHash);
  for (var k = 0; k < segmentList.length; k++) {
    var segment = segmentList[k];

    // Number of ways that share this segment
    var ownerCount = Object.keys(segmentHash[segment]).length - 1;

    // if more not exactly two ways, we keep the original ways
    if (ownerCount !== 2){
      if (ownerCount > 2) {
        var owners = segmentHash[segment]['pair'].map(function (id) {
          return wayHash[id];
        });
        console.log(JSON.stringify(owners));
      }
      // remove segment from merging list
      delete segmentHash[segment];
      continue;
    }

    // verifying same tag
    // this should not be necesseray since we deal with segments
    var owners = segmentHash[segment]['pair'].map(function (id) {
      return wayHash[id];
    });

    // Weirds cases from speedracer.
    // Need to check for a pattern. For the moment we will keep both ways
    if (owners[0] == undefined) {
      // plotKeys = Object.keys(segmentHash[segment]);
      // plotKeys.splice(plotKeys.indexOf('pair'), 1);
      //  for (var m = 0; m < plotKeys.length; m++) {
      //    console.log(JSON.stringify(wayHash[plotKeys[m]]));
      //  }
      delete segmentHash[segment];
      continue;
    }
    if (owners[1] == undefined) {
      delete segmentHash[segment];
      continue;
    }
  }

  // merge based on the segment list we kept
  var segmentList = Object.keys(segmentHash);
  for (var l = 0; l < segmentList.length; l++) {
    // segment shard
    var segment = segmentList[l];

    // getting owners
    var owners = segmentHash[segment]['pair'].map(function (id) {
      return wayHash[id];
    });

    // getting both ways
    var opening = owners[0];
    var closing = owners[1];

    // Case where both ways have only one segment - that's verified
    if (opening === closing) {
      // In that case we want to keep only one of them and remove the former one and continue
      // carefull to check if undefined for updating the hash

      // deleting form heap - not necesseray but releases memory

      delete segmentHash[segment][closing.properties.id];
      segmentHash[segment][opening.properties.id] = true;
      segmentHash[segment]['pair'][1] = opening.properties.id;
      segmentHash[segment]['pair'][0] = opening.properties.id;

      // remove ways from wayHash
      delete wayHash[closing.properties.id];

      delete segmentHash[segment];

    } else {
      // Case were we merge the opening with the closing segment
      var combined = lineString(
        opening.geometry.coordinates.concat(closing.geometry.coordinates.slice(2, closing.geometry.coordinates.length)),
        {
          id: opening.properties.id + 'B' + closing.properties.id,
          refs: opening.properties.refs.concat(closing.properties.refs.slice(2, closing.properties.refs.length))
        }
      );

      // persist oneway and highway tags if they are present
      if (opening.properties.hasOwnProperty('oneway')) combined.properties.oneway = opening.properties.oneway;
      if (opening.properties.hasOwnProperty('highway')) combined.properties.highway = opening.properties.highway;

      // insert combined way into hash
      wayHash[combined.properties.id] = combined;

      // update terminal segment of combined way
      // patch starting segment

      var orgSegment = String(combined.properties.refs.slice(0, 2));
      var endSegment = String(combined.properties.refs.slice(combined.properties.refs.length - 2, combined.properties.refs.length));

      if (segmentHash[orgSegment]) {
        delete segmentHash[orgSegment][opening.properties.id];
        delete segmentHash[orgSegment][closing.properties.id];
        segmentHash[orgSegment][combined.properties.id] = true;
        segmentHash[orgSegment]['pair'][1] = combined.properties.id;
      }

      if (segmentHash[endSegment]) {
        delete segmentHash[endSegment][opening.properties.id];
        delete segmentHash[endSegment][closing.properties.id];
        segmentHash[endSegment][combined.properties.id] = true;
        segmentHash[endSegment]['pair'][0] = combined.properties.id;
      }

      // remove ways from wayHash
      delete wayHash[closing.properties.id];
      delete wayHash[opening.properties.id];

      // deleting form heap - not necesseray but releases memory
      delete segmentHash[segment];
    }
  }

  var merged = Object.keys(wayHash).map(function (id) {
    //console.log(JSON.stringify(wayHash[id]));
  });

  return merged;
}
