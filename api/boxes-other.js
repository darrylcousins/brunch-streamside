'use strict';

/**
  * @module api/products
  * Api to search products from store for adding to a box
  */

const { ObjectID } = require('mongodb');
const {
  makeShopQuery,
} = require('./lib');
const {
  getNZDeliveryDay,
} = require('./order-lib');


exports.getCurrentBoxTitles = async function (req, res, next) {
  // get current box titles by selected date
  const collection = req.app.locals.boxCollection;
  const response = Array();
  const now = new Date();
  const query = {};
  if (Object.hasOwnProperty.call(req.params, "timestamp")) {
    query.delivered = getNZDeliveryDay(req.params.timestamp);
  };
  try {
    collection.distinct("shopify_sku", query, (err, result) => {
        if (err) throw err;
        res.status(200).json(result);
      });
  } catch(e) {
    res.status(400).json({ error: e.toString() });
  };
};

exports.getCurrentBoxesByDate = async function (req, res, next) {
  // get current box by selected date and shopify product id
  const collection = req.app.locals.boxCollection;
  const response = Array();
  const deliveryDay = getNZDeliveryDay(req.params.timestamp);
  try {
    collection.find({ delivered: deliveryDay })
      .sort({shopify_price: 1})
      .toArray((err, result) => {
        if (err) throw err;
        res.status(200).json(result);
      });
  } catch(e) {
    res.status(400).json({ error: e.toString() });
  };
};

exports.getBoxByDateAndProduct = async function (req, res, next) {
  // get current box by selected date and shopify product id
  const collection = req.app.locals.boxCollection;
  const response = Array();
  const deliveryDay = getNZDeliveryDay(req.params.timestamp);
  const product_id = parseInt(req.params.product_id);
  try {
    const box = await collection.findOne({ delivered: deliveryDay, shopify_product_id: product_id });
    res.status(200).json(box);
  } catch(e) {
    res.status(400).json({ error: e.toString() });
  };
};

exports.getCurrentBoxDates = async function (req, res, next) {
  const collection = req.app.locals.boxCollection;
  const response = Array();
  const now = new Date();
  try {
    collection.distinct('delivered', (err, result) => {
      if (err) throw err;
      result.forEach(el => {
        const d = new Date(Date.parse(el));
        //if (d >= now) response.push(d); // no, just get them all
        response.push(d);
      });
      response.sort((d1, d2) => {
        if (d1 < d2) return -1;
        if (d1 > d2) return 1;
        return 0;
      });
      res.status(200).json(response.map(el => el.toDateString()));
    });
  } catch(e) {
    res.status(400).json({ error: e.toString() });
  };
};

