'use strict';

/**
  * @module api/products
  * Api to search products from store for adding to a box
  */

const { ObjectID } = require('mongodb');
const {
  mongoUpdate,
  mongoRemove,
  mongoInsert,
} = require('./order-lib');

exports.getCurrentTodos = async function (req, res, next) {
  const collection = req.app.locals.todoCollection;
  const response = Object();
  let query = {};

  // build query
  if (Array.isArray(req.query.completed)) {
    query.completed = { $in: req.query.completed.map(el => Boolean(parseInt(el))) };
  } else {
    query.completed = Boolean(parseInt(req.query.completed));
  };
  if (req.query.author) {
    query.author = Array.isArray(req.query.author) ? { $in: req.query.author } : req.query.author;
  };
  if (req.query.tags) {
    query.tags = Array.isArray(req.query.tags) ? { $all: req.query.tags } : { $all: [req.query.tags] };
  };

  try {
    collection.find(query).toArray((err, result) => {
      if (err) throw err;
      res.json(result);
    });
  } catch(e) {
    res.status(400).json({ error: e.toString() });
  };
};

exports.addTodo = async function (req, res, next) {
  _logger.info(JSON.stringify(req.body, null, 2));
  try {
    const result = await mongoInsert(req.app.locals.todoCollection, req.body);
    res.status(200).json(result);
  } catch(e) {
    res.status(400).json({ error: e.toString() });
  };
};

exports.editTodo = async function (req, res, next) {
  _logger.info(JSON.stringify(req.body, null, 2));

  try {
    const result = await mongoUpdate(req.app.locals.todoCollection, req.body);
    res.status(200).json(result);
  } catch(e) {
    res.status(400).json({ error: e.toString() });
  };
};

exports.removeTodo = async function (req, res, next) {
  _logger.info(JSON.stringify(req.body, null, 2));
  try {
    const result = await mongoRemove(req.app.locals.todoCollection, req.body);
    res.status(200).json(result);
  } catch(e) {
    res.status(400).json({ error: e.toString() });
  };
};


