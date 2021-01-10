'use-strict';

const { updateOrderTag } = require('../api/order-lib');

module.exports = async function (req, res, next) {
  // collect all orders and update with delivery day
  const collection = req.app.locals.orderCollection;

  try {
    collection.find().toArray((err, result) => {
      if (err) throw err;
      res.set('Content-Type', 'application/json');
      const final = Array();
      result.forEach(async el => {
        await updateOrderTag(el._id.toString(), el.delivered)
          .then(response => final.push(response));
      });
      res.write(JSON.stringify(final));
      res.end();
    });
  } catch(e) {
    res.status(400).json({ error: e.toString() });
  };
};
