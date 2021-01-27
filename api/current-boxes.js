'use strict';
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
  const now = new Date();

  // consider defining fields to avoid the inner product documents
  //https://docs.mongodb.com/drivers/node/fundamentals/crud/read-operations/project
  //
  // filter by dates later than now
  try {
    collection.find().toArray((err, result) => {
      if (err) throw err;
      result.forEach(el => {
        const d = new Date(Date.parse(el.delivered));
        if (d >= now) {
          const delivery = el.delivered;
          if (!response.hasOwnProperty(delivery)) {
            response[delivery] = Array();
          };
          response[delivery].push(el);
        };
      });
      res.status(200).json(response);
    });
  } catch(e) {
    res.status(400).json({ error: e.toString() });
  };
};

module.exports = getCurrentBoxes;
