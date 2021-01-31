/* eslint-disable */
/**
 * Provide some helper methods
 *
 * @module app/helpers
 */

/**
 * Sort an object by it's keys.
 *
 * @function sortObjectByKeys
 * @param {object} o An object
 * @returns {object} The sorted object
 * @example
 * sortObjectByKeys({'c': 0, 'a': 2, 'b': 1});
 * // returns {'a': 2, 'b': 1, 'c': 0}
 */
export const sortObjectByKeys = (o) => {
  return Object.keys(o)
    .sort()
    .reduce((r, k) => ((r[k] = o[k]), r), {});
};

/**
 * Sort an array of objects by key.
 *
 * @function sortObjectByKey
 * @param {object} o An object
 * @param {string} key The attribute to sort
 * @returns {object} The sorted object
 * @example
 * sortObjectByKey([{'s1': 5, 's2': 'e'}, {'s1': 2, 's2': 'b'}], 's1');
 * // returns [{'s1': 2, 's2': 'b'}, {'s1': 5, 's2': 'e'}]
 * sortObjectByKey([{'s1': 5, 's2': 'e'}, {'s1': 2, 's2': 'b'}], 's2');
 * // returns [{'s1': 2, 's2': 'b'}, {'s1': 5, 's2': 'e'}]
 */
export const sortObjectByKey = (o, key) => {
  o.sort((a, b) => {
    let nameA = a[key];
    let nameB = b[key];
    if (!Number.isInteger) {
      nameA = a[key].toUpperCase(); // ignore upper and lowercase
      nameB = b[key].toUpperCase(); // ignore upper and lowercase
    }
    if (nameA < nameB) return -1;
    if (nameA > nameB) return 1;
    return 0;
  });
  return o;
};

/**
 * Get the next upcoming date for a particular weekday
 *
 * @function findNextWeekday
 * @param {number} day Integer day of week, Monday -> 0
 * @returns {object} Date object
 */
const findNextWeekday = (day) => {
  // return the date of next Thursday as 14/01/2021 for example
  // Thursday day is 4, Saturday is 6
  const now = new Date();
  now.setDate(now.getDate() + ((day + (7 - now.getDay())) % 7));
  return now;
};
