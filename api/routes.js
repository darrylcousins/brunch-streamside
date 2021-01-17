'use strict';

const queries = require('./queries');
const routes = require('express').Router();
const syncOrders = require('./sync-orders');
const syncBoxes = require('./sync-boxes');
const tagOrders = require('./tag-orders');

routes.get('/', function (req, res) {
  res.status(404).send('No index for the api');
})

routes.get('/current-orders', queries.getCurrentOrders);
routes.post('/order-sources', queries.getOrderSources);

routes.post('/add-order', queries.addOrder);
routes.post('/edit-order', queries.editOrder);
routes.post('/remove-order', queries.removeOrder);

routes.get('/order-fields', queries.getOrderFields);
routes.post('/delete-orders', queries.deleteOrders);
routes.post('/import-orders', queries.importOrders);
routes.get('/picking-list/:timestamp', queries.downloadPickingList);
routes.get('/orders-download/:timestamp', queries.downloadOrders);

routes.get('/packing-list/:timestamp', queries.getPackingList);

routes.get('/current-todos', queries.getCurrentTodos);
routes.post('/add-todo', queries.addTodo);
routes.post('/edit-todo', queries.editTodo);
routes.post('/remove-todo', queries.removeTodo);

//routes.get('/boxes', queries.getBoxes);
routes.get('/current-boxes', queries.getCurrentBoxes);
routes.get('/current-box-dates', queries.getCurrentBoxDates);

routes.get('/sync-boxes', syncBoxes);
routes.get('/sync-orders', syncOrders);
routes.get('/tag-orders', tagOrders);

module.exports = routes;

