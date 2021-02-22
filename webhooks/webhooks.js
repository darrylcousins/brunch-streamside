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

  // for webhooks the body is a raw string
  const order = processOrderJson(JSON.parse(req.body.toString()));

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

  const body = JSON.parse(req.body);

  _logger.info(`Webhook received updating delivered date from tag: \n${ body.id }\n${ body.tags }\n${ body.name }`);

  // Updating 
  try {
    body.tags.split(',').forEach(tag => {
      const parsed = Date.parse(tag.trim());
      if (Boolean(parsed)) {
        const date = new Date(parsed);
        const data = {
          _id: body.id,
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

  const body = JSON.parse(req.body.toString());
  _logger.info(JSON.stringify(body, null, 2));

  const { id, order_number } = body;
  _logger.info(id, order_number);

  const collection = req.app.locals.orderCollection;
  collection.deleteOne({_id: parseInt(id), order_number: parseInt(order_number)}, (err, result) => {
    if (err) {
      _logger.error(`Webhook error orderFulfilled. ${ err }`);
    };
    if (result.result.n > 0) {
      _logger.info(`Webhook received and order fulfilled and deleted: ${ id } ${ order_number }`);
    } else {
      _logger.info(`Webhook received and no orders deleted: ${ id } ${ order_number }`);
    }
  });

};

