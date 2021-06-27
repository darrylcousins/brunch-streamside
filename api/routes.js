'use strict';

const queries = require('./queries');
const products = require('./products');
const routes = require('express').Router();
const syncOrders = require('./sync-orders');
const syncBoxes = require('./sync-boxes');
const tagOrders = require('./tag-orders');
const getCurrentBoxes = require('./current-boxes');
const getCurrentBoxesByProduct = require('./current-boxes-by-product');
const getCurrentBoxesForBoxProduct = require('./current-boxes-for-box-product');

routes.get('/', function (req, res) {
  res.status(404).send('No index for the api');
})

routes.get('/current-orders', queries.getCurrentOrders);
routes.get('/current-orders-by-date/:timestamp', queries.getCurrentOrdersByDate);
routes.get('/current-order-dates', queries.getCurrentOrderDates); // includes count by delivery date
routes.get('/orders-by-ids', queries.getOrdersByIds);
routes.post('/order-sources', queries.getOrderSources);

routes.post('/add-order', queries.addOrder);
routes.post('/edit-order', queries.editOrder);
routes.post('/remove-order', queries.removeOrder);
routes.post('/bulk-edit-orders', queries.bulkEditOrders);

routes.get('/order-fields', queries.getOrderFields);
routes.post('/remove-orders', queries.removeOrders);
routes.post('/import-orders', queries.importOrders);
routes.get('/picking-list-download/:timestamp', queries.downloadPickingList);
routes.get('/orders-download/:timestamp', queries.downloadOrders);

routes.get('/packing-list/:timestamp', queries.getPackingList);
routes.get('/packing-list-download/:timestamp', queries.downloadPackingList);

routes.get('/current-todos', queries.getCurrentTodos);
routes.post('/add-todo', queries.addTodo);
routes.post('/edit-todo', queries.editTodo);
routes.post('/remove-todo', queries.removeTodo);

routes.post('/add-setting', queries.addSetting);
routes.get('/current-settings', queries.getCurrentSettings);
routes.get('/settings-for-app', queries.getSettingsForApp);
routes.post('/edit-setting', queries.editSetting);
routes.post('/edit-settings', queries.editSettings);
routes.post('/remove-setting', queries.removeSetting);

//routes.get('/boxes', queries.getBoxes);
routes.get('/current-boxes', getCurrentBoxes);
routes.get('/current-boxes-by-product/:product_id', getCurrentBoxesByProduct);
routes.get('/current-boxes-for-box-product/:box_product_id', getCurrentBoxesForBoxProduct);
routes.get('/box-by-date-and-product/:product_id/:timestamp', queries.getBoxByDateAndProduct);
routes.get('/current-box-titles/:timestamp', queries.getCurrentBoxTitles);
routes.get('/current-box-dates', queries.getCurrentBoxDates);
routes.get('/current-boxes-by-date/:timestamp', queries.getCurrentBoxesByDate);
routes.get('/get-core-box', products.getCoreBox);
routes.post('/create-core-box', products.createCoreBox);
routes.post('/delete-core-box', products.deleteCoreBox);

routes.post('/query-store-boxes', products.queryStoreBoxes);
routes.post('/query-store-products', products.queryStoreProducts);
routes.post('/add-product-to-box', products.addProductToBox);
routes.post('/remove-product-from-box', products.removeProductFromBox);
routes.post('/add-box', products.addBox);
routes.post('/remove-box', products.removeBox);
routes.post('/duplicate-boxes', products.duplicateBoxes);
routes.post('/remove-boxes', products.removeBoxes);
routes.post('/toggle-box-active', products.toggleBoxActive); // accepts box_id or delivered

routes.get('/sync-boxes', syncBoxes);
routes.get('/sync-orders', syncOrders);
routes.get('/tag-orders', tagOrders);

module.exports = routes;

