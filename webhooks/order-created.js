/**
 * @module webhook/order-created
 */

const {
  processOrderJson,
  insertOrder,
  updateOrderTag,
} = require("../api/order-lib");

/**
 * Webhook received from Shopify when order created. Store data and update
 * delivery date tag on Shopify order.
 *
 * @function orderCreated
 * @param {object} req Request object
 * @param {object} res Response object
 * @returns {Response} Respond 200 OK to Shopify
 */
const orderCreated = async function (req, res) {
  // send receipt notification to avoid timeouts and errors
  res.status(200).json({ success: "order create webhook received" });

  const collection = req.app.locals.orderCollection;

  // check firstly if order already stored
  // check for open and fulfillment and paid??
  // check if tag already stored

  const order = processOrderJson(req.body);
  insertOrder(collection, order);
  updateOrderTag(order._id.toString(), order.delivered);

  _logger.info(
    `Webhook received and order updated: \n${JSON.stringify(order, null, 2)}`
  );
};

module.exports = orderCreated;
