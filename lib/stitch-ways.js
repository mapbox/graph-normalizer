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

    // we should acutally not hash the geometry but rather the sorted sequence of refs
    // as nodes are unique, we will keept the unicity
    var md5sum = crypto.createHash('md5');
    md5sum.update(JSON.stringify(way.properties.refs.slice().sort()));
    way.properties.hash = md5sum.digest('hex');

    // Hash the way geometry
    // var md5sum = crypto.createHash('md5');
    // md5sum.update(JSON.stringify(way.geometry.coordinates));
    // way.properties.hash = md5sum.digest('hex');

    // this step removed duplicated ways with different ids i.e. in different tiles.
    // they dont need to be merged
    if (wayHash[way.properties.hash]) continue;

    // Store the way in the hash
    wayHash[way.properties.hash] = way;

    // we should actually insert the reversed segments if bidirectionnal way.
    // another option will be to duplicate ways - then no need to touch the hash
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
    if (ownerCount < 2) {
      // Remove segment from merging list - no merge needed
      delete segmentHash[segment];
      continue;
    }

    var opening = undefined;
    var closing = undefined;

    var hashs = Object.keys(segmentHash[segment]);
    for (var l = 0; l < hashs.length; l++) {
      var hash = hashs[l];
      var owner = wayHash[hash];

      orgSegment = String(owner.properties.refs.slice(0, 2));
      endSegment = String(owner.properties.refs.slice(owner.properties.refs.length - 2, owner.properties.refs.length));

      if (orgSegment === segment) {
        if (!closing) closing = owner;
        if (owner.properties.refs.length > closing.properties.refs.length) {
          closing = owner;
        }
      }

      if (endSegment === segment) {
        if (!opening) opening = owner;
        if (owner.properties.refs.length > opening.properties.refs.length) {
          opening = owner;
        }
      }
    }

    // that's wierd cased on z7 tile boundaries.
    // filter that out for now
    if ((!opening) || (!closing)) {
      delete segmentHash[segment];
      continue;
    }

    segmentHash[segment]['pair'] = [opening, closing];
  }

  // merge what is in queue
  segmentList = Object.keys(segmentHash);
  for (var m = 0; m < segmentList.length; m++) {
    // segment shared
    segment = segmentList[m];

    // getting segments to merge
    opening = segmentHash[segment]['pair'][0];
    closing = segmentHash[segment]['pair'][1];

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

    // hash the way using the sorted ref sequence
    var md5sum = crypto.createHash('md5');
    md5sum.update(JSON.stringify(combined.properties.refs.slice().sort()));
    combined.properties.hash = md5sum.digest('hex');

    // // Hash the way geometry
    // md5sum = crypto.createHash('md5');
    // md5sum.update(JSON.stringify(combined.geometry.coordinates));
    // combined.properties.hash = md5sum.digest('hex');

    // insert combined way into hash
    wayHash[combined.properties.hash] = combined;

    var ownerHashs = Object.keys(segmentHash[segment]);
    ownerHashs.splice(ownerHashs.indexOf('pair'), 1);
    for (var n = 0; n < ownerHashs.length; n++) {
      hash = ownerHashs[n];
      // avoid deleting combined way in inclusion case
      if (combined.properties.hash !== hash) delete wayHash[hash];
    }

    // delete segment from queue
    delete segmentHash[segment];

    // update the queued
    orgSegment = String(combined.properties.refs.slice(0, 2));
    endSegment = String(combined.properties.refs.slice(combined.properties.refs.length - 2, combined.properties.refs.length));

    // if orgsement is on mergelist
    if (segmentHash[orgSegment] !== undefined) {
      segmentHash[orgSegment][combined.properties.hash] = true;
      segmentHash[orgSegment]['pair'][1] = combined;
    }

    if (segmentHash[endSegment] !== undefined) {
      segmentHash[endSegment][combined.properties.hash] = true;
      segmentHash[endSegment]['pair'][0] = combined;
    }
  }

  var ways = [];
  var nodes = {};
  var wayKeys = Object.keys(wayHash);
  for (var d = 0; d < wayKeys.length; d++) {
    way = wayHash[wayKeys[d]];
    ways.push(way);
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
    // console.log(JSON.stringify(node));
  }

  return ways;
};
