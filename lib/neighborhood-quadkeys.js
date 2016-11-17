'use strict';

var tilebelt = require('tilebelt');

module.exports = function (quadkeys) {
  var newQuadkeys = {};
  for (var k = 0; k < quadkeys.length; k++) {
    var quadkey = quadkeys[k];
    var tile = tilebelt.quadkeyToTile(quadkey);
    for (var i = -1; i < 2; i++) {
      for (var j = -1; j < 2; j++) {
        var neighborQuadkey = tilebelt.tileToQuadkey([tile[0] + i, tile[1] + j, tile[2]]);
        newQuadkeys[neighborQuadkey] = 1;
      }
    }
  }
  return Object.keys(newQuadkeys);
};
