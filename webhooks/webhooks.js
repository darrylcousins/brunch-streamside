'use strict';

const { mongoUpdate, processOrderJson, insertOrder, updateOrderTag } = require('../api/order-lib');

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

// method to update orders to local mongodb
exports.orderUpdated = async function (req, res, next) {
  // primary pupose to update delivery date if tag has been changed

  // send receipt notification to avoid timeouts and errors
  res.status(200).json({ success: 'order update webhook received' });

  const collection = req.app.locals.orderCollection;

  _logger.info(`Webhook received updating delivered date from tag: \n${ req.body.id }\n${ req.body.tags }\n${ req.body.name }`);

  // Updating 
  try {
    req.body.tags.split(',').forEach(tag => {
      const parsed = Date.parse(tag.trim());
      if (Boolean(parsed)) {
        const date = new Date(parsed);
        const data = {
          _id: req.body.id,
          delivered: date.toDateString()
        }
        mongoUpdate(collection, data);
      } else {
        _logger.info(tag, 'is not a date string');
      }
    })
  } catch(err) {
    _logger.info(`Webhook error on update: \n${ req.body.name }\n${ req.body.tags }`);
  }

  //console.log(JSON.stringify(order, null, 2));
  //_logger.info(`Webhook received and order updated: \n${ JSON.stringify(req.body, null, 2) }`);

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

