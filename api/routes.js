'use strict';

const routes = require('express').Router();
const syncOrders = require('./sync-orders');
const syncBoxes = require('./sync-boxes');
const tagOrders = require('./tag-orders');

const getCurrentBoxes = require('./current-boxes');
const getCurrentBoxesByProduct = require('./current-boxes-by-product');
const getCurrentBoxesForBoxProduct = require('./current-boxes-for-box-product');
const boxes = require('./boxes-other');
const queries = require('./queries');
const products = require('./products');
const packinglist = require('./packing-list');
const settings = require('./settings');
const subscribers = require('./subscribers');
const todos = require('./todos');

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
routes.get('/orders-download/:timestamp', queries.downloadOrders);

routes.get('/picking-list-download/:timestamp', packinglist.downloadPickingList);
routes.get('/packing-list/:timestamp', packinglist.getPackingList);
routes.get('/packing-list-download/:timestamp', packinglist.downloadPackingList);

routes.get('/current-todos', todos.getCurrentTodos);
routes.post('/add-todo', todos.addTodo);
routes.post('/edit-todo', todos.editTodo);
routes.post('/remove-todo', todos.removeTodo);

routes.post('/add-setting', settings.addSetting);
routes.get('/current-settings', settings.getCurrentSettings);
routes.get('/settings-for-app', settings.getSettingsForApp);
routes.post('/edit-setting', settings.editSetting);
routes.post('/edit-settings', settings.editSettings);
routes.post('/remove-setting', settings.removeSetting);

// uses settings table, add and edit use Setting methods
routes.get('/current-box-rules', settings.getCurrentBoxRules);
routes.get('/box-rules-for-app', settings.getBoxRulesForApp);

routes.post('/add-subscriber', subscribers.addSubscriber);
routes.get('/current-subscribers', subscribers.getCurrentSubscribers);
routes.post('/edit-subscriber', subscribers.editSubscriber);
routes.post('/remove-subscriber', subscribers.removeSubscriber);

//routes.get('/boxes', queries.getBoxes);
routes.get('/current-boxes', getCurrentBoxes);
routes.get('/current-boxes-by-product/:product_id', getCurrentBoxesByProduct);
routes.get('/current-boxes-for-box-product/:box_product_id', getCurrentBoxesForBoxProduct);
routes.get('/box-by-date-and-product/:product_id/:timestamp', boxes.getBoxByDateAndProduct);
routes.get('/current-box-titles/:timestamp', boxes.getCurrentBoxTitles); // returns skus
routes.get('/current-box-titles', boxes.getCurrentBoxTitles); // returns skus
routes.get('/current-box-dates', boxes.getCurrentBoxDates);
routes.get('/current-boxes-by-date/:timestamp', boxes.getCurrentBoxesByDate);
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

