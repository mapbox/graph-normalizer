'use strict';

module.exports = function (way, quadkeys, quadHash) {
  for (var i = 0; i < quadkeys.length; i++) {
    var quadkey = quadkeys[i];
    if (quadHash[quadkey] === undefined) quadHash[quadkey] = [];
    quadHash[quadkey].push(way);
  }
};
