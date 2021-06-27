'use strict';
/**
  * @module api/current-boxes
  */

/**
  * Collect current boxes from database
  * Used by the in-store app to get boxes for a Container box
  *
  * @function getCurrentBoxes
  * @returns {object} Arrays of boxes grouped by delivery date
  */
const getCurrentBoxesByProduct = async function (req, res, next) {
  const collection = req.app.locals.boxCollection;
  const response = Object();
  const now = new Date();
  const product_id = parseInt(req.params.product_id);

  const cutOffSetting = await req.app.locals.settingCollection.findOne({handle: "cutoff-hours"});
  const cutOffHours = parseFloat(cutOffSetting.value);

  let hoursDiff;

  /**
   * Get upcoming delivery dates to filter boxes by
  */
  const distinctDeliveryDates = (colln) => {
    return new Promise((resolve, reject) => {
      colln.distinct('delivered', (err, data) => {
        if (err) return reject(err);
        const final = Array();
        data.forEach(el => {
          const d = new Date(el);
          if (d > now) {
            hoursDiff = Math.abs(d - now) / 36e5;
            if (cutOffHours <= hoursDiff) {
              final.push(d);
            };
          };
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
  // https://docs.mongodb.com/drivers/node/fundamentals/crud/read-operations/project
  // TODO absolutely essential the data is unique by delivered and shopify_product_id
  // filter by dates later than now
  try {
    collection.find({
      delivered: {$in: dates},
      active: true,
      shopify_product_id: product_id
    }).toArray((err, result) => {
      if (err) throw err;
      result.forEach(el => {
        response[el.delivered] = el;
      });
      res.status(200).json(response);
    });
  } catch(e) {
    res.status(400).json({ error: e.toString() });
  };
};

module.exports = getCurrentBoxesByProduct;

