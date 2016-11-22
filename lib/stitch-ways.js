'use strict';

var lineString = require('turf-linestring');
var crypto = require('crypto');

module.exports = function (ways) {
  var segmentHash = {};
  var wayHash = {};

  // Building hash
  for (var i = 0; i < ways.length; i++) {
    // get the way
    var way = ways[i];

    // Hash the way geometry
    var md5sum = crypto.createHash('md5');
    md5sum.update(JSON.stringify(way.geometry.coordinates));
    way.properties.hash = md5sum.digest('hex');

    // this step removed duplicated ways with different ids i.e. in different tiles.
    // they dont need to be merged
    if (wayHash[way.properties.hash]) continue;

    // Store the way in the hash
    wayHash[way.properties.hash] = way;

    // update the segment hash with this way
    var orgSegment = String(way.properties.refs.slice(0, 2));
    var endSegment = String(way.properties.refs.slice(way.properties.refs.length - 2, way.properties.refs.length));

    // Adding id to the hash
    if (!segmentHash[orgSegment]) segmentHash[orgSegment] = {};
    if (!segmentHash[endSegment]) segmentHash[endSegment] = {};

    segmentHash[orgSegment][way.properties.hash] = true;
    segmentHash[endSegment][way.properties.hash] = true;
  }

  // build merge queue
  var segmentList = Object.keys(segmentHash);
  for (var k = 0; k < segmentList.length; k++) {
    var segment = segmentList[k];

    // Number of ways that share this segment
    var ownerCount = Object.keys(segmentHash[segment]).length;

    // dont merge less than two ways
    if (ownerCount < 2){
      // Remove segment from merging list - no merge needed
      delete segmentHash[segment];
      continue;
    }

    // Finding opener and closer
    var opening = undefined;
    var closing = undefined;

    var hashs = Object.keys(segmentHash[segment]);
    for (var l = 0; l < hashs.length; l++) {
      var hash = hashs[l];
      var owner = wayHash[hash];

      var orgSegment = String(owner.properties.refs.slice(0, 2));
      var endSegment = String(owner.properties.refs.slice(owner.properties.refs.length - 2, owner.properties.refs.length));

      if (l === 0) {
        opening = owner;
        closing = owner;
        continue;
      }

      if (orgSegment === segment) {
        if (owner.properties.refs.length > closing.properties.refs.length) {
          closing = owner;
        }
      }

      if (endSegment === segment) {
        if (owner.properties.refs.length > opening.properties.refs.length) {
          opening = owner;
        }
      }
    }
    segmentHash[segment]['pair'] = [opening, closing];
  }

  // merge what is in queue
  var segmentList = Object.keys(segmentHash);
  for (var m = 0; m < segmentList.length; m++) {
    // segment shared
    var segment = segmentList[m];

    // getting segments to merge
    var opening = segmentHash[segment]['pair'][0];
    var closing = segmentHash[segment]['pair'][1];

    // merging ways
    var combined = lineString(
      opening.geometry.coordinates.concat(closing.geometry.coordinates.slice(2, closing.geometry.coordinates.length)),
      {
        id: opening.properties.id + '*S*' + closing.properties.id,
        refs: opening.properties.refs.concat(closing.properties.refs.slice(2, closing.properties.refs.length))
      }
    );

    // persist oneway and highway tags if they are present
    if (opening.properties.hasOwnProperty('oneway')) combined.properties.oneway = opening.properties.oneway;
    if (opening.properties.hasOwnProperty('highway')) combined.properties.highway = opening.properties.highway;

    // Hash the way geometry
    var md5sum = crypto.createHash('md5');
    md5sum.update(JSON.stringify(combined.geometry.coordinates));
    combined.properties.hash = md5sum.digest('hex');

    // insert combined way into hash
    wayHash[combined.properties.hash] = combined;

    // remove the owners
    ownerHashs = Object.keys(segmentHash[segment]);
    ownerHashs.splice(ownerHashs.indexOf('pair'), 1);
    for (var n = 0; n < ownerHashs.length; n++) {
      var hash = ownerHashs[n];
      delete wayHash[hash];
    }

    // delete segment from queue
    delete segmentHash[segment];

    // update the queued
    var orgSegment = String(combined.properties.refs.slice(0, 2));
    var endSegment = String(combined.properties.refs.slice(combined.properties.refs.length - 2, combined.properties.refs.length));

    // if orgsement is on mergelist
    if (segmentHash[orgSegment] != undefined) {
      segmentHash[orgSegment][combined.properties.hash] = true;
      segmentHash[orgSegment]['pair'][1] = combined;
    }

    if (segmentHash[endSegment] != undefined) {
      segmentHash[endSegment][combined.properties.hash] = true;
      segmentHash[endSegment]['pair'][0] = combined;
    }
  }

  var nodes = {};
  var wayKeys = Object.keys(wayHash)
  for (var d = 0; d < wayKeys.length; d++) {
    var way = wayHash[wayKeys[d]];
    // console.log(JSON.stringify(way));

    var orgNode = {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: way.geometry.coordinates[0]
      },
      properties: {
        id: way.properties.refs[0]
      }
    };

    var endNode = {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: way.geometry.coordinates[way.geometry.coordinates.length - 1]
      },
      properties: {
        id: way.properties.refs[way.properties.refs.length - 1]
      }
    };

    nodes[orgNode.properties.id] = orgNode;
    nodes[endNode.properties.id] = endNode;

  }

  var nodeIds = Object.keys(nodes);
  for (var f = 0; f < nodeIds.length; f++) {
    var node = nodes[nodeIds[f]];
    console.log(JSON.stringify(node));
  }

};
