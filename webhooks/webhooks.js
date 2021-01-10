'use strict';

const { processOrderJson, insertOrder, updateOrderTag } = require('../api/order-lib');

// method to add orders to local mongodb
exports.orderCreated = async function (req, res, next) {

  // send receipt notification to avoid timeouts and errors
  res.status(200).json({ success: 'order create webhook received' });

  const collection = req.app.locals.orderCollection;

  // check firstly if order already stored
  // check for open and fulfillment and paid??
  // check if tag already stored

  const order = processOrderJson(req.body);
  insertOrder(collection, order);
  updateOrderTag(order._id.toString(), order.delivered);

  //console.log(JSON.stringify(order, null, 2));
  _logger.info(`Webhook received and order updated: \n${ JSON.stringify(order, null, 2) }`);

};

// method to remove fulfilled and completed orders from local mongodb
exports.orderFulfilled = async function (req, res, next) {

  // send receipt notification to avoid timeouts and errors
  res.status(200).json({ success: 'order fulfillment webhook received' });

  const { id, order_number } = req.body;

  const collection = req.app.locals.orderCollection;
  collection.deleteOne({_id: parseInt(id), order_number: parseInt(order_number)}, (err, result) => {
    if (err) {
      _logger.error(`Webhook error orderFulfilled. ${ err }`);
    };
    _logger.info(`Webhook received and order fulfilled and deleted: ${ id } ${ order_number }`);
  });

};

