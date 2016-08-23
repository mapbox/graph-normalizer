'use strict';

/**
 * Helper function for quick object cloning; used for dereferencing.
 * @param  {Object} obj object to be cloned
 * @return {Object} dereferenced object
 */
module.exports = function (obj) {
  if (obj === undefined) return undefined;
  return JSON.parse(JSON.stringify(obj));
};
