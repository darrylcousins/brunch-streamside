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
  mongoUpdate,
  mongoRemove,
  mongoInsert,
} = require('./order-lib');

/*
 * @function addSubscriber
 *
 * Add a subscriber, parameters from req.body:
 * @param handle
 * @param title
 * @param value
 * @param tag
 * @param tag
 */
exports.addSubscriber = async function (req, res, next) {
  _logger.info(JSON.stringify(req.body, null, 2));
  const doc = {...req.body};
  doc._id = new ObjectID();
  try {
    const result = await mongoInsert(req.app.locals.subscriberCollection, doc);
    res.status(200).json(result);
  } catch(e) {
    res.status(400).json({ error: e.toString() });
  };
};

/*
 * @function getCurrentSubscribers
 *
 * Returns all subscribers as a list grouped by tag
 *
 */
exports.getCurrentSubscribers = async function (req, res, next) {
  const collection = req.app.locals.subscriberCollection;
  const query = {};
  try {
    collection.find(query).toArray((err, result) => {
      if (err) throw err;
      res.status(200).json(result);
    });
  } catch(e) {
    res.status(400).json({ error: e.toString() });
  };
};

exports.editSubscriber = async function (req, res, next) {
  _logger.info(JSON.stringify(req.body, null, 2));
  const doc = {...req.body};
  doc._id = ObjectID(doc._id);
  try {
    const result = await mongoUpdate(req.app.locals.subscriberCollection, doc);
    res.status(200).json(result);
  } catch(e) {
    res.status(400).json({ error: e.toString() });
  };
};

exports.removeSubscriber = async function (req, res, next) {
  _logger.info(JSON.stringify(req.body, null, 2));
  const doc = {...req.body};
  doc._id = ObjectID(doc._id);
  try {
    const result = await mongoRemove(req.app.locals.subscriberCollection, doc);
    res.status(200).json(result);
  } catch(e) {
    res.status(400).json({ error: e.toString() });
  };
};

