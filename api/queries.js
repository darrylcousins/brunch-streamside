'use strict';

const MongoClient = require('mongodb').MongoClient;
const uri = 'mongodb://localhost';
const mongoClient = new MongoClient(uri, { useUnifiedTopology: true });
const xlsx = require('json-as-xlsx')
const syncBoxes = require('./sync-boxes');
const { getIds, getRow, headersPartial, orderPartialQuery } = require('./orders');
const { getOrder, orderFullQuery, headersFull } = require('./order');

const sortObjectByKeys = (o) => Object.keys(o).sort().reduce((r, k) => (r[k] = o[k], r), {});

exports.getCurrentBoxes = async function (req, res, next) {
  const collection = req.app.locals.dbCollection;
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
  let orders = Array();
  let pickingMap = new Map();
  try {
    const ids = await getIds();
    for (var i=0; i<ids.length; i++) {
      const { row, pickingList } = await getRow(ids[i], pickingMap, null, orderPartialQuery);
      orders.push(row);
      pickingMap = pickingList;
    };

  } catch(e) {
    res.status(400).json({ error: e.toString() });
    return;
  };
  res.set('Content-Type', 'application/json');
  let response = Object();
  response.headers = headersPartial;
  let finalOrders = Object();
  let delivered;
  orders.forEach(el => {
    delivered = el[1] ? el[1] : 'No Date';
    if (!finalOrders.hasOwnProperty(delivered)) {
      finalOrders[delivered] = Array();
    };
    finalOrders[delivered].push(el);
  });
  response.orders = finalOrders;
  response.pickingList = Object();
  for (let [key, value] of pickingMap) {
    if (key) { // still picking up orders without delivery date
      response.pickingList[key] = Object.fromEntries(value);
    };
  };
  res.write(JSON.stringify(response));
  res.end();
};

const getNZDeliveryDay = (timestamp) => {
  const d = new Date(parseInt(timestamp)).toLocaleString("en-NZ", {timeZone: "Pacific/Auckland"});
  const parts = d.split(',')[0].split('/');
  const dateString = `${parts[1]}/${parts[0]}/${parts[2]}`; // converts say 7/01/2021 to 01/7/2021
  const deliveryDay = new Date(dateString)
    .toDateString(); // results in say Thu Jan 07 2021 as in above example
  return deliveryDay;
};

exports.downloadOrders = async function (req, res, next) {
  const deliveryDay = getNZDeliveryDay(req.params.timestamp);

  let orders = Array();
  try {
    const ids = await getIds();
    for (var i=0; i<ids.length; i++) {
      const { row, pickingList } = await getRow(ids[i], null, deliveryDay, orderFullQuery);
      orders.push(row);
    };
  } catch(e) {
    res.status(400).json({ error: e.toString() });
    return; // do we need this??
  };

  orders = orders
    .filter(el => el !== null)
    .sort((a, b) => {
      var nameA = a[1].toUpperCase(); // ignore upper and lowercase
      var nameB = b[1].toUpperCase(); // ignore upper and lowercase
      if (nameA < nameB) return -1;
      if (nameA > nameB) return 1;
      return 0;
    });
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
    orders.forEach(row => {
      const [
        logo,
        box,
        deliveryday,
        order,
        runid,
        firstname,
        lastname,
        addressline,
        suburb,
        city,
        postcode,
        telephone,
        excluding,
        extras,
        deliverynote,
        shopnote
      ] = row;
      content.push(
        {
          logo,
          box,
          deliveryday,
          order,
          runid,
          firstname,
          lastname,
          addressline,
          suburb,
          city,
          postcode,
          telephone,
          excluding,
          extras,
          deliverynote,
          shopnote
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
};

exports.downloadPickingList = async function (req, res, next) {
  // need to choose by date
  // to solve this curfufel try storing all dates as ISO dates
  const deliveryDay = getNZDeliveryDay(req.params.timestamp);

  let pickingMap = new Map();
  try {
    const ids = await getIds();
    for (var i=0; i<ids.length; i++) {
      const { row, pickingList } = await getRow(ids[i], pickingMap, deliveryDay, orderPartialQuery);
      pickingMap = pickingList;
    };
  } catch(e) {
    res.status(400).json({ error: e.toString() });
    return; // do we need this??
  };
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

    let finalPickingList = Object.fromEntries(pickingMap.get(deliveryDay));
    finalPickingList = sortObjectByKeys(finalPickingList);
    for (const [key, value] of Object.entries(finalPickingList)) {
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
};

exports.getOrder = async function (req, res, next) {
  let row;
  try {
    const order = await getOrder(req.params.id, orderFullQuery);
    row = order.row;
  } catch(e) {
    res.status(400).json({ error: e.toString() });
    return;
  };
  res.set('Content-Type', 'application/json');
  res.write('{"order":');
  res.write(JSON.stringify(row));
  res.end('}');
};

exports.syncBoxes = async function (req, res, next) {
  const boxDocuments = await syncBoxes();
  const collection = req.app.locals.dbCollection;
  // insert into mongodb
  collection.insertMany(boxDocuments)
    .then(result => {
      res.status(200).json({ success: 'success' });
    })
    .catch(e => {
      res.status(400).json({ error: e.toString() });
    });
};
