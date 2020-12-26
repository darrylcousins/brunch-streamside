'use strict';

const MongoClient = require('mongodb').MongoClient;
const uri = 'mongodb://localhost';
const mongoClient = new MongoClient(uri, { useUnifiedTopology: true });
const shopifyOrders = require('./shopify-orders');
const syncBoxes = require('./sync-boxes');

exports.getCurrentBoxes = async function (req, res, next) {
  const collection = req.app.locals.dbCollection;
  try {
    //const cursor = await collection.find({ delivered: { $gte: new Date() }}).toArray();
    //res.status(200).json(cursor);
    res.set('Content-Type', 'application/json');
    res.write('[');
    let prevChunk = null;
    collection.find({ delivered: { $gte: new Date() }})
      .on('data', (data) => {
        if (prevChunk) res.write(JSON.stringify(prevChunk) + ',');
        prevChunk = data;
      })
      .on('end', () => {
        if (prevChunk) res.write(JSON.stringify(prevChunk));
        res.end(']');
      });
  } catch(e) {
    res.status(400).json({ error: e.toString() });
  };
};

exports.getCurrentOrders = async function (req, res, next) {
  try {
    const orders = await shopifyOrders();
    console.log(orders);
    res.status(200).json(orders);
  } catch(e) {
    res.status(400).json({ error: e.toString() });
  };
};

exports.syncBoxes = async function (req, res, next) {
  const boxDocuments = await syncBoxes();
  const collection = req.app.locals.dbCollection;
  // insert into mongodb
  collection.insertMany(boxDocuments)
    .then(result => {
      console.log(result);
      res.status(200).json({ success: 'success' });
    })
    .catch(e => {
      res.status(400).json({ error: e.toString() });
    });
};
