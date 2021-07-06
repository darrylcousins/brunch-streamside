'use strict';
const MongoClient = require('mongodb').MongoClient;
const { ObjectID } = require('mongodb');
const uri = 'mongodb://localhost';
const mongoClient = new MongoClient(uri, { useUnifiedTopology: true });
const xlsx = require('json-as-xlsx');
const Excel = require('exceljs');
const {
  matchNumberedString,
  getNZDeliveryDay,
  headersPartial,
  headersFull,
  orderFields,
  NODELIVER_STRING,
  orderImportCSV,
  orderImportXLSX,
  insertOrder,
  mongoUpdate,
  mongoRemove,
  mongoInsert,
  updateOrderTag
} = require('./order-lib');
const {
  getBoxPromises,
  isFruit,
  isBread,
  getQueryFilters,
  conformSKU,
  sortObjectByKey,
} = require('./lib');

exports.getOrderSources = async function (req, res, next) {
  const collection = req.app.locals.orderCollection;
  const query = req.body;
  _logger.info(JSON.stringify(req.body, null, 2));
  const response = Object();
  try {
    collection.distinct('source', query, (err, result) => {
      if (err) throw err;
      res.status(200).json(result);
    });
  } catch(e) {
    res.status(400).json({ error: e.toString() });
  };
};

exports.addOrder = async function (req, res, next) {
  _logger.info(JSON.stringify(req.body, null, 2));
  try {
    const result = await mongoInsert(req.app.locals.orderCollection, req.body);
    res.status(200).json(result);
  } catch(e) {
    res.status(400).json({ error: e.toString() });
  };
};

exports.editOrder = async function (req, res, next) {
  _logger.info(JSON.stringify(req.body, null, 2));
  // are we updating the date?
  try {
    const result = await mongoUpdate(req.app.locals.orderCollection, req.body);
    if (req.body.source === 'Shopify') {
      _logger.info(`Updating order tag for ${req.body.delivered}`);
      // TODO actually not good enough XXX sorted - May 2021?
      // 1. will add new tag and not replace tag
      // 2. not checking for actual change in value
      updateOrderTag(req.body._id.toString(), req.body.delivered);
    }
    res.status(200).json(result);
  } catch(e) {
    res.status(400).json({ error: e.toString() });
  };
};

exports.removeOrder = async function (req, res, next) {
  _logger.info(`Removing order: ${JSON.stringify(req.body, null, 2)}`);
  try {
    const result = await mongoRemove(req.app.locals.orderCollection, req.body);
    res.status(200).json(result);
  } catch(e) {
    res.status(400).json({ error: e.toString() });
  };
};

exports.bulkEditOrders = async function (req, res, next) {
  // only updating pickup date for now
  _logger.info(JSON.stringify(req.body, null, 2));
  const collection = req.app.locals.orderCollection;
  try {
    const { _ids, ...parts } = req.body;
    const result = await collection.updateMany(
      { _id: { $in: _ids.map(id => parseInt(id)) } },
      { $set: { ...parts } }
    );
    res.status(200).json(result);
  } catch(e) {
    res.status(400).json({ error: e.toString() });
  };
};

exports.getOrderFields = async function (req, res, next) {
  res.status(200).json(orderFields);
};

exports.removeOrders = async function (req, res, next) {
  const collection = req.app.locals.orderCollection;
  const { sources, delivered } = req.body;
  const query = {delivered, source: {$in: sources }};
  const response = Object();
  try {
    collection.deleteMany(query, (err, result) => {
      if (err) throw err;
      _logger.info(`Removing orders: ${result.result.n} objects deleted`);
      res.status(200).json({ count: result.result.n });
    });
  } catch(e) {
    _logger.warn(e.toString());
    res.status(400).json({ error: e.toString() });
  };
};

exports.getOrdersByIds = async function (req, res, next) {
  let ids = [];
  const collection = req.app.locals.orderCollection;
  try {
    if (Object.keys(req.query).length) {
      if (Object.hasOwnProperty.call(req.query, 'ids')) {
        ids = req.query.ids.split(",").map(el => parseInt(el));
      };
    };
    collection.find({_id: {$in: ids}}).toArray((err, result) => {
      if (err) throw err;
      res.status(200).json(result);
    })
  } catch(e) {
    res.status(400).json({ error: e.toString() });
  };
};

exports.getCurrentOrdersByDate = async function (req, res, next) {

  const deliveryDay = getNZDeliveryDay(req.params.timestamp);
  const collection = req.app.locals.orderCollection;
  const response = Object();

  let query = getQueryFilters(req, {
    sku: {$ne: null},
    delivered: { $in: [deliveryDay, NODELIVER_STRING]}
  });

  try {
    collection.find(query).toArray((err, result) => {
      if (err) throw err;

      // order by box title
      response.orders = sortObjectByKey(result, 'sku');
      response.headers = headersPartial;
      res.set('Content-Type', 'application/json');
      res.write(JSON.stringify(response));
      res.end();
    });
  } catch(e) {
    res.status(400).json({ error: e.toString() });
  };
};

exports.getCurrentOrders = async function (req, res, next) {
  // no longer used - now selecting date for display
  let filter_field = null;
  let filter_value = null;
  if (Object.keys(req.query).length) {
    if (Object.hasOwnProperty.call(req.query, 'filter_field')) {
      filter_field = req.query.filter_field;
    };
    if (Object.hasOwnProperty.call(req.query, 'filter_value')) {
      filter_value = req.query.filter_value;
    };
  }
  console.log(filter_field, filter_value);
  const collection = req.app.locals.orderCollection;
  const response = Object();
  const finalOrders = Object();
  const boxCounts = Object();
  const boxes = Object();  // later need to read directly from boxes
  let query = {sku: {$ne: null}};
  if (filter_field && filter_value) {
    query[filter_field] = filter_value;
  };
  console.log(query);
  try {
    collection.find(query).sort({delivered: -1}).toArray((err, result) => {
      if (err) throw err;
      result.forEach(el => {
        const delivery = el.delivered;
        const box = conformSKU(el.sku);

        if (!boxCounts.hasOwnProperty(delivery)) {
          boxCounts[delivery] = Object();
        };
        if (!boxCounts[delivery].hasOwnProperty(box)) {
          boxCounts[delivery][box] = Object();
          boxCounts[delivery][box]['count'] = 1;
        } else {
          boxCounts[delivery][box]['count'] += 1;
        };

        if (el.source === 'Shopify') {
          // should always be set by now???
          boxCounts[delivery][box]['including'] = el.including;
          if (!boxes.hasOwnProperty(box)) {
            boxes[box] = el.including;
          }
        };

        if (!finalOrders.hasOwnProperty(delivery)) {
          finalOrders[delivery] = Array();
        };
        finalOrders[delivery].push(el);
      });
      response.boxes = boxes;
      response.boxCounts = boxCounts;
      //response.pickingList = pickingLists;
      response.orders = finalOrders;
      response.headers = headersPartial;
      res.set('Content-Type', 'application/json');
      res.write(JSON.stringify(response));
      res.end();
    });
  } catch(e) {
    res.status(400).json({ error: e.toString() });
  };

};

exports.getCurrentOrderDates = async function (req, res, next) {
  const collection = req.app.locals.orderCollection;
  const response = {};
  try {
    collection.aggregate(
      [{
        $group: {
          _id: "$delivered",
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: -1 }
      },
      ]).toArray((err, result) => {
        if (err) throw err;
        result.forEach(({_id, count}) => {
          response[_id] = count;
        });
      res.status(200).json(response);
    });
  } catch(e) {
    res.status(400).json({ error: e.toString() });
  };
};

exports.importOrders = async function (req, res, next) {
  // post file for import
  // first figure if bucky or csa
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).json({ error: 'No files were uploaded.' });
  };
  if (req.files.hasOwnProperty('orders')) {
    const orders = req.files.orders;
    const delivered = req.body.delivered; // uploading to this date only
    const collection = req.app.locals.orderCollection;

    if (orders.mimetype !== 'text/csv' && orders.mimetype !== 'application/vnd.ms-excel' && orders.mimetype !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      return res.status(400).json({ error: 'Could not parse data. Uploaded file should be a csv or xlsx file.' });
    };
    let result = true;
    _logger.info(`Uploading order for ${delivered} using ${orders.mimetype}`);
    if (orders.mimetype === 'text/csv' || orders.mimetype === 'application/vnd.ms-excel') {
      result = orderImportCSV(orders.data, delivered, collection);
    } else if (orders.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      result = orderImportXLSX(orders.data, delivered, collection);
    };
    if (result) {
      return res.json(({
        mimetype: orders.mimetype,
        count: result.count ? result.count : true,
        delivered,
        success: 'Got file' }));
    } else {
      return res.status(400).json({ error: 'Import failed. An error occurred.' });
    }
  };
};

exports.downloadOrders = async function (req, res, next) {
  const deliveryDay = getNZDeliveryDay(req.params.timestamp);
  const collection = req.app.locals.orderCollection;
  const query = getQueryFilters(req, {
    delivered: { $in: [deliveryDay, NODELIVER_STRING]}
  });
  let fileName = `box-orders-${deliveryDay.replace(/ /g, '-').toLowerCase()}.xlsx`; // The name of the spreadsheet
  if (Object.hasOwnProperty.call(query, 'pickup')) {
    const testDate = new Date(query.pickup);
    fileName = (testDate === NaN) ? fileName :  `box-orders-${testDate.toDateString().replace(/ /g, '-').toLowerCase()}.xlsx`;
  };
  try {
    collection.find(query).toArray((err, result) => {
      if (err) throw err;

      // order by box title
      result = sortObjectByKey(result, 'sku');

      try {
        var settings = {
          sheetName: 'Boxes', // The name of the sheet
          fileName, // The name of the spreadsheet
          extraLength: 3, // A bigger number means that columns should be wider
          writeOptions: {} // Style options from https://github.com/SheetJS/sheetjs#writing-options
        };

        var download = true // If true will download the xlsx file, otherwise will return a buffer

        var columns = headersFull.map(el => {
          return { label: el, value: el.replace(' #', '').replace(' ', '').toLowerCase() };
        });

        var content = Array();
        result.forEach(row => {
          content.push(
            {
              select: '',
              logo: '',
              box: row.sku,
              deliveryday: row.delivered,
              order: row.order_number,
              runid: '',
              firstname: row.first_name,
              lastname: row.last_name,
              addressline: row.address1,
              suburb: row.address2,
              city: row.city,
              postcode: row.zip,
              telephone: row.phone,
              excluding: row.removed.join('\n'),
              extras: row.addons.join('\n'),
              deliverynote: row.note,
              shopnote: row.shopnote ? row.shopnote : '',
              source: row.source
            }
          );
        });

        var buffer = xlsx(columns, content, settings, false)
        res.writeHead(200, {
          'Content-Type': 'application/octet-stream',
          'Content-disposition': `attachment; filename=${fileName}`
        })
        res.end(buffer)
      } catch(e) {
        res.status(400).json({ error: e.toString() });
        return;
      };
    });
  } catch(e) {
    res.status(400).json({ error: e.toString() });
    return; // do we need this??
  };

};

