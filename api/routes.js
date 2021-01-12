'use strict';

const queries = require('./queries');
const routes = require('express').Router();
const syncOrders = require('./sync-orders');
const syncBoxes = require('./sync-boxes');
const tagOrders = require('./tag-orders');

routes.get('/', function (req, res) {
  res.status(404).send('No index for the api');
})

//routes.get('/boxes', queries.getBoxes);
routes.get('/current-boxes', queries.getCurrentBoxes);
routes.get('/current-orders', queries.getCurrentOrders);
routes.post('/order-sources', queries.getOrderSources);
routes.post('/save-order', queries.saveOrder);
routes.get('/order-fields', queries.getOrderFields);
routes.post('/delete-orders', queries.deleteOrders);
routes.post('/import-orders', queries.importOrders);
routes.get('/picking-list/:timestamp', queries.downloadPickingList);
routes.get('/orders-download/:timestamp', queries.downloadOrders);

routes.get('/current-todos', queries.getCurrentTodos);
routes.post('/save-todo', queries.saveTodo);

routes.get('/sync-boxes', syncBoxes);
routes.get('/sync-orders', syncOrders);
routes.get('/tag-orders', tagOrders);

module.exports = routes;

