'use strict';

const routes = require('express').Router();
const webhooks = require('./webhooks');

routes.get('/', function (req, res) {
  res.status(404).send('No index for the webhooks');
})

routes.post('/order-created', webhooks.orderCreated);
routes.post('/order-updated', webhooks.orderUpdated);
routes.post('/order-fulfilled', webhooks.orderFulfilled);

module.exports = routes;
