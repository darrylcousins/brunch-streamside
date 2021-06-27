'use strict';
/**
  * @module api/current-boxes
  */

/**
  * Collect current boxes from database
  * @function getCurrentBoxes
  * @returns {object} Arrays of boxes grouped by delivery date
  */
const getCurrentBoxesForBoxProduct = async function (req, res, next) {
  const collection = req.app.locals.boxCollection;
  const response = Object();
  const now = new Date();
  const box_product_id = parseInt(req.params.box_product_id, 10);

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
          if (d >= now) final.push(d);
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
    collection
      .find({
        delivered: {$in: dates},
        active: true,
        $or: [
          { includedProducts: { $elemMatch: { shopify_product_id: box_product_id } } },
          { addOnProducts: { $elemMatch: { shopify_product_id: box_product_id } } }
        ]
      })
      /*
      .project({
        delivered: 1, shopify_title: 1, shopify_product_id: 1, shopify_variant_id: 1
      })
      */
      .toArray((err, result) => {
        if (err) throw err;
        result.forEach(el => {
          if (!response.hasOwnProperty(el.shopify_handle)) {
            response[el.shopify_handle] = Array();
          };
          const item = { ...el };
          item.includedProduct = el.includedProducts.some(prod => prod.shopify_product_id === box_product_id);
          if (!item.includedProduct) {
            item.addOnProduct = el.addOnProducts.some(prod => prod.shopify_product_id === box_product_id) ? true : false;
          }

          response[el.shopify_handle].push(item);
        });
        res.status(200).json(response);
      });
  } catch(e) {
    res.status(400).json({ error: e.toString() });
  };
};

module.exports = getCurrentBoxesForBoxProduct;
