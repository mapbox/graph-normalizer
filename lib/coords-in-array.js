'use strict';

/**
 * Helper function for quick object cloning; used for dereferencing.
 * @param  {Array} coords a [lng, lat] Array
 * @param {Array} array an array of [lng, lat] coordinates (a LinString)
 * @param {Int} precision the number of digits to check for equality.
 * @return {Int} i the index of the point in the array. Return -1 if not found.
 */
module.exports = function (coords, array, start, precision) {
  start = start === undefined ? 0 : start;
  precision = precision === undefined ? 7 : precision;
  for (var i = start, n = array.length; i < n; i++) {
    if (array[i][0].toFixed(precision) === coords[0].toFixed(precision) &&
        array[i][1].toFixed(precision) === coords[1].toFixed(precision)) {
      return i;
    }
  }
  return -1;
};
