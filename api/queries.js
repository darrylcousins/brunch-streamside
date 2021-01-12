'use strict';

require('isomorphic-fetch');
const MongoClient = require('mongodb').MongoClient;
const uri = 'mongodb://localhost';
const mongoClient = new MongoClient(uri, { useUnifiedTopology: true });
const xlsx = require('json-as-xlsx')
const syncBoxes = require('./sync-boxes');
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
  mongoInsert
} = require('./order-lib');

const sortObjectByKeys = (o) => Object.keys(o).sort().reduce((r, k) => (r[k] = o[k], r), {});

const sortObjectByKey = (o, key) => {
  o.sort((a, b) => {
    var nameA = a[key].toUpperCase(); // ignore upper and lowercase
    var nameB = b[key].toUpperCase(); // ignore upper and lowercase
    if (nameA < nameB) return -1;
    if (nameA > nameB) return 1;
    return 0;
  });
  return o;
};

exports.getOrderSources = async function (req, res, next) {
  const collection = req.app.locals.orderCollection;
  const query = req.body;
  _logger.info(JSON.stringify(req.body, null, 2));
  const response = Object();
  try {
    collection.distinct('source', query, (err, result) => {
      if (err) throw err;
      res.status(200).json(JSON.stringify(result));
    });
  } catch(e) {
    res.status(400).json({ error: e.toString() });
  };
};

exports.saveOrder = async function (req, res, next) {
  const data = req.body;
  const collection = req.app.locals.orderCollection;
  _logger.info(JSON.stringify(data, null, 2));
  try {
    insertOrder(collection, data);
    res.status(200).json(JSON.stringify({ success: true }));
  } catch(e) {
    res.status(400).json({ error: e.toString() });
  };
};

exports.getOrderFields = async function (req, res, next) {
  res.status(200).json(JSON.stringify(orderFields));
};

exports.deleteOrders = async function (req, res, next) {
  const collection = req.app.locals.orderCollection;
  const { sources, delivered } = req.body;
  const query = {delivered, source: {$in: sources }};
  const response = Object();
  try {
    collection.deleteMany(query, (err, result) => {
      if (err) throw err;
      _logger.info(result.result.n, 'objects deleted');
      res.status(200).json(JSON.stringify({ count: result.result.n }));
    });
  } catch(e) {
    _logger.warn(e.toString());
    res.status(400).json({ error: e.toString() });
  };
};

exports.getCurrentTodos = async function (req, res, next) {
  const collection = req.app.locals.todoCollection;
  const response = Object();
  try {
    collection.find().toArray((err, result) => {
      if (err) throw err;
      res.json(result);
    });
  } catch(e) {
    res.status(400).json({ error: e.toString() });
  };
};

exports.saveTodo = async function (req, res, next) {
  const data = req.body;
  const collection = req.app.locals.todoCollection;
  _logger.info(JSON.stringify(data, null, 2));
  try {
    mongoInsert(collection, data);
    res.status(200).json(JSON.stringify({ success: true }));
  } catch(e) {
    res.status(400).json({ error: e.toString() });
  };
};

exports.getCurrentBoxes = async function (req, res, next) {
  const collection = req.app.locals.boxCollection;
  const response = Object();
  try {
    collection.find({ delivered: { $gte: new Date() }}).toArray((err, result) => {
      if (err) throw err;
      result.forEach(el => {
        const delivery = el.delivered.toDateString();
        if (!response.hasOwnProperty(delivery)) {
          response[delivery] = Array();
        };
        response[delivery].push(el);
      });
      res.set('Content-Type', 'application/json');
      res.write(JSON.stringify(response));
      res.end();
    });
  } catch(e) {
    res.status(400).json({ error: e.toString() });
  };
};

exports.getCurrentOrders = async function (req, res, next) {
  const collection = req.app.locals.orderCollection;
  const response = Object();
  const finalOrders = Object();
  const pickingLists = Object();
  try {
    collection.find().toArray((err, result) => {
      if (err) throw err;
      result.forEach(el => {
        const delivery = el.delivered;
        if (!finalOrders.hasOwnProperty(delivery)) {
          finalOrders[delivery] = Array();
        };
        finalOrders[delivery].push(el);
        if (!delivery.startsWith('No')) {
          if (!pickingLists.hasOwnProperty(delivery)) {
            pickingLists[delivery] = Object();
          };
          el.addons.forEach(product => {
            let { str, count } = matchNumberedString(product);
            if (count == 0) count = 1;
            if (!pickingLists[delivery].hasOwnProperty(str)) {
              pickingLists[delivery][str] = count;
            } else {
              pickingLists[delivery][str] += count;
            };
          });
        };
      });
      response.pickingList = pickingLists;
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

exports.importOrders = async function (req, res, next) {
  // post file for import
  // first figure if bucky or csa
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).json({ error: 'No files were uploaded.' });
  };
  if (req.files.hasOwnProperty('orders')) {
    const orders = req.files.orders;
    const collection = req.app.locals.orderCollection;
    if (orders.mimetype !== 'text/csv' && orders.mimetype !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      return res.status(400).json({ error: 'Could not parse data. Uploaded file is of wrong mimetype.' });
    };
    let result = true;
    console.log(orders.mimetype);
    console.log(JSON.stringify(orders.data, null, 2));
    if (orders.mimetype === 'text/csv') {
      result = orderImportCSV(orders.data, collection);
    } else {
      result = orderImportXLSX(orders.data, collection);
    };
    if (result) {
      return res.json(({
        mimetype: orders.mimetype,
        count: result.count ? result.count : true,
        success: 'Got file' }));
    } else {
      return res.status(400).json({ error: 'Import failed.' });
    }
  };
};

exports.downloadOrders = async function (req, res, next) {
  const deliveryDay = getNZDeliveryDay(req.params.timestamp);
  const collection = req.app.locals.orderCollection;
  try {
    collection.find({ delivered: { $in: [deliveryDay, NODELIVER_STRING]}}).toArray((err, result) => {
      if (err) throw err;

      // order by box title
      result = sortObjectByKey(result, 'sku');

      try {
        var settings = {
          sheetName: 'Boxes', // The name of the sheet
          fileName: `boxes-${ deliveryDay.replace(' ', '-') }`, // The name of the spreadsheet
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
              'Content-disposition': `attachment; filename=${settings.fileName}.xlsx`
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

exports.downloadPickingList = async function (req, res, next) {
  const deliveryDay = getNZDeliveryDay(req.params.timestamp);
  const collection = req.app.locals.orderCollection;
  try {
    collection.find({ delivered: { $in: [deliveryDay, NODELIVER_STRING]}}).toArray((err, result) => {
      if (err) throw err;

      try {
        var settings = {
          sheetName: 'Picking List', // The name of the sheet
          fileName: `picking-list-${ deliveryDay.replace(' ', '-') }`, // The name of the spreadsheet
          extraLength: 3, // A bigger number means that columns should be wider
          writeOptions: {} // Style options from https://github.com/SheetJS/sheetjs#writing-options
        };

        var download = true // If true will download the xlsx file, otherwise will return a buffer

        var columns = [
          { label: 'Item', value: 'item' }, // Top level data
          { label: 'Quantity', value: 'qty' }, // More configuration available
          // see https://github.com/LuisEnMarroquin/json-as-xlsx
        ];

        var content = Array();
        let pickingList = Object();
        result.forEach(row => {
          row.addons.forEach(product => {
            let { str, count } = matchNumberedString(product);
            if (count == 0) count = 1;
            if (!pickingList.hasOwnProperty(str)) {
              pickingList[str] = count;
            } else {
              pickingList[str] += count;
            };
          });
        });
        pickingList = sortObjectByKeys(pickingList);
        for (const [key, value] of Object.entries(pickingList)) {
          content.push(
            { 'item': key, 'qty': value }
          );
        };

        var buffer = xlsx(columns, content, settings, false)
        res.writeHead(200, {
              'Content-Type': 'application/octet-stream',
              'Content-disposition': `attachment; filename=${settings.fileName}.xlsx`
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
