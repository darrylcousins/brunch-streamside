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

/*
 * @function addSetting
 *
 * Add a setting, parameters from req.body:
 * @param handle
 * @param title
 * @param value
 * @param tag
 * @param tag
 */
exports.addSetting = async function (req, res, next) {
  _logger.info(JSON.stringify(req.body, null, 2));
  const doc = {...req.body};
  doc._id = new ObjectID();
  try {
    const result = await mongoInsert(req.app.locals.settingCollection, doc);
    res.status(200).json(result);
  } catch(e) {
    res.status(400).json({ error: e.toString() });
  };
};

/*
 * @function getCurrentSettings
 *
 * Returns all settings as a list grouped by tag
 *
 */
exports.getCurrentSettings = async function (req, res, next) {
  const collection = req.app.locals.settingCollection;
  try {
    collection.aggregate(
      [{
        $group: {
          _id: "$tag",
          settings: { $push: "$$ROOT" }
        }
      },
      ]).toArray((err, result) => {
        if (err) throw err;
        res.status(200).json(result);
    });
  } catch(e) {
    res.status(400).json({ error: e.toString() });
  };
};

/*
 * @function getCurrentBoxRules
 *
 * Returns box settings only as box rules
 *
 */
exports.getCurrentBoxRules = async function (req, res, next) {
  const collection = req.app.locals.settingCollection;
  const response = {};
  try {
    collection.find({handle: "box-rule"}).toArray((err, result) => {
        if (err) throw err;
        res.status(200).json(result);
    });
  } catch(e) {
    res.status(400).json({ error: e.toString() });
  };
};

/*
 * @function getSettingsForApp
 *
 * Returns all settings as a list grouped by tag
 *
 */
exports.getSettingsForApp = async function (req, res, next) {
  const collection = req.app.locals.settingCollection;
  const response = {};
  try {
    collection.aggregate(
      [{
        $group: {
          _id: "$tag",
          settings: { $push: { handle: "$handle", value: "$value" } }
        },
      },
      ]).toArray((err, result) => {
        if (err) throw err;
        result.forEach(el => {
          response[el._id] = {};
          el.settings.forEach(setting => {
            response[el._id][setting.handle] = setting.value;
          });
        });
        res.status(200).json(response);
    });
  } catch(e) {
    res.status(400).json({ error: e.toString() });
  };
};

/*
 * @function getBoxRulesForApp
 *
 * Returns box rule settings as a list grouped by tag
 *
 */
exports.getBoxRulesForApp = async function (req, res, next) {
  const collection = req.app.locals.settingCollection;
  const response = {};
  try {
    collection.find({handle: "box-rule"},
      {projection: {box: 1, weekday: 1, value: 1}}).toArray((err, result) => {
        if (err) throw err;
        res.status(200).json(result);
    });
  } catch(e) {
    res.status(400).json({ error: e.toString() });
  };
};

exports.editSetting = async function (req, res, next) {
  _logger.info(JSON.stringify(req.body, null, 2));
  const doc = {...req.body};
  doc._id = ObjectID(doc._id);
  try {
    const result = await mongoUpdate(req.app.locals.settingCollection, doc);
    _logger.info(JSON.stringify(result, null, 2));
    res.status(200).json(result);
  } catch(e) {
    res.status(400).json({ error: e.toString() });
  };
};

exports.editSettings = async function (req, res, next) {
  _logger.info(JSON.stringify(req.body, null, 2));
  const response = [];
  try {
    await req.body.forEach(async (doc) => {
      doc._id = ObjectID(doc._id);
      const result = await mongoUpdate(req.app.locals.settingCollection, doc);
      response.push(result);
    });
    res.status(200).json(response);
  } catch(e) {
    res.status(400).json({ error: e.toString() });
  };
};

exports.removeSetting = async function (req, res, next) {
  _logger.info(JSON.stringify(req.body, null, 2));
  const doc = {...req.body};
  doc._id = ObjectID(doc._id);
  try {
    const result = await mongoRemove(req.app.locals.settingCollection, doc);
    res.status(200).json(result);
  } catch(e) {
    res.status(400).json({ error: e.toString() });
  };
};

