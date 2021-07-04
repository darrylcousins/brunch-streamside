/* eslint-disable */
/**
 * Provide some helper methods
 *
 * @module app/helpers
 */

export const hasOwnProp = Object.prototype.hasOwnProperty;

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
export const findNextWeekday = (day) => {
  // return the date of next Thursday as 14/01/2021 for example
  // Thursday day is 4, Saturday is 6
  const now = new Date();
  now.setDate(now.getDate() + ((day + (7 - now.getDay())) % 7));
  return now;
};

/**
 * Get date string to pass to input[type=date], i.e. "2020-12-31"
 *
 * @function dateStringForInput
 * @param {string} A date string to pass to new Date.
 * @returns {object} Date string
 */
export const dateStringForInput = (str) => {
  let d;
  let dateString;
  if (str) {
    d = new Date(str);
  } else {
    d = new Date();
  }
  const zeroPad = (num, places) => String(num).padStart(places, "0");
  const year = d.getFullYear();
  const day = zeroPad(d.getDate(), 2);
  const month = zeroPad(d.getMonth() + 1, 2);

  return `${year}-${month}-${day}`;
};

/** Provide standard animationOptions
 *
 * @member {object} animationOptions
 */
export const animationOptions = {
  duration: 400,
  easing: "ease",
  fill: "both",
};

/**
 * Animate a fade and execute an action on end
 *
 * @function animateFadeForAction
 */
export const animateFadeForAction = (id, action) => {
  let target;
  if (typeof id === "string") {
    target = document.getElementById(id);
  } else {
    target = id;
  }
  const animate = target.animate(
    {
      opacity: 0.1,
    },
    animationOptions
  );
  animate.addEventListener("finish", async () => {
    if (action) {
      await action();
    }
    target.animate(
      {
        opacity: 1,
      },
      animationOptions
    );
  });
};

/**
 * Animate a fade
 *
 * @function animateFade
 */
export const animateFade = (id, opacity) => {
  let target;
  if (typeof id === "string") {
    target = document.getElementById(id);
  } else {
    target = id;
  }
  const animate = target.animate(
    {
      opacity,
    },
    animationOptions
  );
};
