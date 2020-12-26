'use strict';

const queries = require('./queries');
const routes = require('express').Router();

routes.use(function(req, res, next) {
  console.log('Accessing api.');
  next();
});

routes.get('/', function (req, res) {
  res.status(404).send('No index for the api');
})

//routes.get('/boxes', queries.getBoxes);
routes.get('/current-boxes', queries.getCurrentBoxes);
routes.get('/current-orders', queries.getCurrentOrders);
routes.get('/sync-boxes', queries.syncBoxes);

module.exports = routes;

