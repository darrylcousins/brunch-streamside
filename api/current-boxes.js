'use strict';
const { sortObjectByKey } = require('./queries');

/**
  * @module api/current-boxes
  */

/**
  * Collect current boxes from database
  * @function getCurrentBoxes
  * @returns {object} Arrays of boxes grouped by delivery date
  */
const getCurrentBoxes = async function (req, res, next) {
  const collection = req.app.locals.boxCollection;
  const response = Object();

  /**
   * Get upcoming delivery dates to filter boxes by
  */
  const distinctDeliveryDates = (colln) => {
    return new Promise((resolve, reject) => {
      colln.distinct('delivered', (err, data) => {
        if (err) return reject(err);
        const final = Array();
        data.forEach(el => {
          const d = new Date(Date.parse(el));
          final.push(d);
        });
        final.sort((d1, d2) => {
          if (d1 < d2) return -1;
          if (d1 > d2) return 1;
          return 0;
        });
        resolve(final.map(el => el.toDateString()));
      })
    })
  }

  const dates = await distinctDeliveryDates(collection)
    .then(dates => {
      return dates;
    })
    .catch(err => res.status(400).json({ error: e.toString() }));

  // consider defining fields to avoid the inner product documents
  //https://docs.mongodb.com/drivers/node/fundamentals/crud/read-operations/project
  //
  // filter by dates later than now
  try {
    collection.find({delivered: {$in: dates}}).toArray((err, result) => {
      if (err) throw err;
      result.forEach(el => {
        const d = new Date(Date.parse(el.delivered));
        const delivery = el.delivered;
        // collate into object with delivery date as key - can this be done in
        // mongo api - not with aggregation as far as I can figure
        if (!response.hasOwnProperty(delivery)) {
          response[delivery] = Array();
        };
        response[delivery].push(el);
        // sort by price
      });
      for (const key in response) {
        response[key] = sortObjectByKey(response[key], "shopify_price");
      }
      res.status(200).json(response);
    });
  } catch(e) {
    res.status(400).json({ error: e.toString() });
  };
};

module.exports = getCurrentBoxes;
