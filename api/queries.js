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
  mongoUpdate,
  mongoRemove,
  mongoInsert,
  updateOrderTag
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

exports.addOrder = async function (req, res, next) {
  _logger.info(JSON.stringify(req.body, null, 2));
  try {
    const result = await mongoInsert(req.app.locals.orderCollection, req.body);
    res.status(200).json(JSON.stringify(result));
  } catch(e) {
    res.status(400).json({ error: e.toString() });
  };
};

exports.editOrder = async function (req, res, next) {
  _logger.info(JSON.stringify(req.body, null, 2));
  try {
    const result = await mongoUpdate(req.app.locals.orderCollection, req.body);
    if (req.body.source === 'Shopify') {
      _logger.info(`Updating order tag for ${req.body.delivered}`);
      // TODO actually not good enough
      // 1. will add new tag and not replace tag
      // 2. not checking for actual change in value
      updateOrderTag(req.body._id.toString(), req.body.delivered);
    }
    res.status(200).json(JSON.stringify(result));
  } catch(e) {
    res.status(400).json({ error: e.toString() });
  };
};

exports.removeOrder = async function (req, res, next) {
  _logger.info(JSON.stringify(req.body, null, 2));
  try {
    const result = await mongoRemove(req.app.locals.orderCollection, req.body);
    res.status(200).json(JSON.stringify(result));
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

exports.addTodo = async function (req, res, next) {
  _logger.info(JSON.stringify(req.body, null, 2));
  try {
    const result = await mongoInsert(req.app.locals.todoCollection, req.body);
    res.status(200).json(JSON.stringify(result));
  } catch(e) {
    res.status(400).json({ error: e.toString() });
  };
};

exports.editTodo = async function (req, res, next) {
  _logger.info(JSON.stringify(req.body, null, 2));

  try {
    const result = await mongoUpdate(req.app.locals.todoCollection, req.body);
    res.status(200).json(JSON.stringify(result));
  } catch(e) {
    res.status(400).json({ error: e.toString() });
  };
};

exports.removeTodo = async function (req, res, next) {
  _logger.info(JSON.stringify(req.body, null, 2));
  try {
    const result = await mongoRemove(req.app.locals.todoCollection, req.body);
    res.status(200).json(JSON.stringify(result));
  } catch(e) {
    res.status(400).json({ error: e.toString() });
  };
};

exports.getCurrentBoxes = async function (req, res, next) {
  const collection = req.app.locals.boxCollection;
  const response = Object();
  const now = new Date();
  try {
    collection.find().toArray((err, result) => {
      if (err) throw err;
      result.forEach(el => {
        const d = new Date(Date.parse(el.delivered));
        if (d >= now) {
          const delivery = el.delivered;
          if (!response.hasOwnProperty(delivery)) {
            response[delivery] = Array();
          };
          response[delivery].push(el);
        };
      });
      res.set('Content-Type', 'application/json');
      res.write(JSON.stringify(response));
      res.end();
    });
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
        if (d >= now) response.push(d);
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

const conformSKU = (str) => {
  // mixed up titles with Big Veg on Shopify and Big Vege elsewhere
  if (str.startsWith('Big')) return 'Big Vege';
  return str;
};

exports.getCurrentOrders = async function (req, res, next) {
  const collection = req.app.locals.orderCollection;
  const response = Object();
  const finalOrders = Object();
  const pickingLists = Object();
  const boxCounts = Object();
  const boxes = Object();  // later need to read directly from boxes
  try {
    collection.find().toArray((err, result) => {
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
        if (!delivery.startsWith('No')) {
          if (!pickingLists.hasOwnProperty(delivery)) {
            pickingLists[delivery] = Object();
          };
          el.addons.forEach(product => {
            let { str, count } = matchNumberedString(product);
            if (count === 0) count = 1;

            if (!pickingLists[delivery].hasOwnProperty(str)) {
              pickingLists[delivery][str] = count;
            } else {
              pickingLists[delivery][str] += count;
            };

          });
        };
      });
      response.boxes = boxes;
      response.boxCounts = boxCounts;
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
    const delivered = req.body.delivered; // uploading to this date only
    const collection = req.app.locals.orderCollection;
    if (orders.mimetype !== 'text/csv' && orders.mimetype !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      return res.status(400).json({ error: 'Could not parse data. Uploaded file is of wrong mimetype.' });
    };
    let result = true;
    _logger.info(`Uploading order for ${delivered} using ${orders.mimetype}`);
    if (orders.mimetype === 'text/csv') {
      result = orderImportCSV(orders.data, delivered, collection);
    } else {
      result = orderImportXLSX(orders.data, delivered, collection);
    };
    if (result) {
      return res.json(({
        mimetype: orders.mimetype,
        count: result.count ? result.count : true,
        delivered,
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

exports.getPackingList = async function (req, res, next) {
  const deliveryDay = getNZDeliveryDay(req.params.timestamp);
  _logger.info(deliveryDay);
  let response = Object();

  let collection = req.app.locals.boxCollection;

  const stuff = await req.app.locals.boxCollection.find({ delivered: deliveryDay}).toArray();
  const boxes = stuff.map(el => ({box: el.shopify_sku, including: el.includedProducts}));

  const final = boxes.map(async el => {
    const regex = new RegExp(`^${el.box}`)
    const orders = await req.app.locals.orderCollection.find({
      sku: { $regex: regex },
      delivered: deliveryDay
    }).toArray();
    el.order_length = orders.length;
    el.extras = Object();
    orders.forEach(order => {
      if (order.addons.length) {
        order.addons.forEach(product => {
          let { str, count } = matchNumberedString(product);
          if (count == 0) count = 1;
          if (!el.extras.hasOwnProperty(str)) {
            el.extras[str] = count;
          } else {
            el.extras[str] += count;
          };
        });
      };
    });
    return el;
  });

  const getData = async (map) => {
    return Promise.all(map);
  }

  getData(final).then(data => {
    console.log(data);
    res.status(200).json(data);
  });

  return;
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
