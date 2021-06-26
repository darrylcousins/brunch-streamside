'use strict';
const MongoClient = require('mongodb').MongoClient;
const { ObjectID } = require('mongodb');
const uri = 'mongodb://localhost';
const mongoClient = new MongoClient(uri, { useUnifiedTopology: true });
const xlsx = require('json-as-xlsx');
const Excel = require('exceljs');
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
const {
  getPickingList,
  getBoxPromises,
  isFruit,
  isBread
} = require('./lib');

const sortObjectByKeys = (o) => Object.keys(o).sort().reduce((r, k) => (r[k] = o[k], r), {});

const sortObjectByKey = (o, key) => {
  o.sort((a, b) => {
    let nameA = a[key];
    let nameB = b[key];
    if (!Number.isInteger) {
      nameA = a[key].toUpperCase(); // ignore upper and lowercase
      nameB = b[key].toUpperCase(); // ignore upper and lowercase
    }
    if (nameA < nameB) return -1;
    if (nameA > nameB) return 1;
    return 0;
  });
  return o;
};

exports.sortObjectByKeys = sortObjectByKeys;
exports.sortObjectByKey = sortObjectByKey;

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
  doc._id = ObjectID();
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

exports.editSetting = async function (req, res, next) {
  _logger.info(JSON.stringify(req.body, null, 2));
  const doc = {...req.body};
  doc._id = ObjectID(doc._id);
  try {
    const result = await mongoUpdate(req.app.locals.settingCollection, doc);
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

exports.getCurrentBoxTitles = async function (req, res, next) {
  // get current box titles by selected date
  const collection = req.app.locals.boxCollection;
  const response = Array();
  const now = new Date();
  const deliveryDay = getNZDeliveryDay(req.params.timestamp);
  try {
    collection.find({ delivered: deliveryDay })
      .sort({shopify_sku: 1})
      .toArray((err, result) => {
        if (err) throw err;
        res.status(200).json(result.map(el => el.shopify_sku));
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
  if (str && str.startsWith('Big')) return 'Big Vege';
  return str;
};

const getQueryFilters = (req, query) => {
  // get query parameters
  let filter_field = null;
  let filter_value = null;
  if (Object.keys(req.query).length) {
    if (Object.hasOwnProperty.call(req.query, 'filter_field')) {
      filter_field = req.query.filter_field;
    };
    if (Object.hasOwnProperty.call(req.query, 'filter_value')) {
      const testDate = new Date(parseInt(req.query.filter_value));
      filter_value = (testDate === NaN) ? req.query.filter_value : testDate.toDateString();
    };
  };
  if (filter_field && filter_value) {
    query[filter_field] = filter_value;
  };
  return query;
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

exports.getPackingList = async function (req, res, next) {
  const deliveryDay = getNZDeliveryDay(req.params.timestamp);

  const fullBoxes = await req.app.locals.boxCollection.find({ delivered: deliveryDay}).toArray();
  // slim down array to the essentials i.e. just the title and included products
  const boxes = fullBoxes.map(el => ({box: el.shopify_sku, including: el.includedProducts}));
  const query = getQueryFilters(req, {delivered: deliveryDay});
  console.log('first', query);
  const final = getBoxPromises(boxes, query, req.app.locals.orderCollection);

  const getData = async (map) => {
    return Promise.all(map);
  }

  getData(final).then(data => {
    /* finally we add in totals for for the picking list
     * we need the boxes so that the standard items are included
     * NB the excluded products are not accounted for
     * NOTE
     * data object has: 
     * box: sku + the count
     * including: the string array of included products (picking list is product * count)
     * extras: the object array of product name: pick count
     */
    const response = Object();
    data = data.filter(el => el.order_count !== 0);
    data = data.map(el => {
      el.box += ` (${el.order_count})`;
      return el;
    });
    response.total_boxes = data.map(el => el.order_count).reduce(function(a, b){
     return a + b;
    }, 0);

    response.boxes = data;
    response.picking = getPickingList(data);
    res.status(200).json(response);
  });

  return;
};

exports.downloadPackingList= async function (req, res, next) {
  const deliveryDay = getNZDeliveryDay(req.params.timestamp);
  const fullBoxes = await req.app.locals.boxCollection.find({ delivered: deliveryDay}).toArray();
  // slim down array to the essentials i.e. just the title and included products
  const boxes = fullBoxes.map(el => ({box: el.shopify_sku, including: el.includedProducts}));
  const query = getQueryFilters(req, {delivered: deliveryDay});
  const final = getBoxPromises(boxes, query, req.app.locals.orderCollection);

  const getData = async (map) => {
    return Promise.all(map);
  }

  getData(final).then(data => {
    data.sort((a, b) => (a.box < b.box) ? 1 : -1);

    const workbook = new Excel.Workbook();
    const worksheet = workbook.addWorksheet('Packing');

    const rows = Array();
    const columns = Array();
    // make array of arrays
    const products = Object();
    let customBoxCount = 0;
    const rowkeys = Array();
    
    data.forEach(el => {
      console.log(el.box, el.order_count)
      if (!el.box.startsWith('Custom') && el.order_count) {
        const key = el.box.toLowerCase().replace(/ /g, '-');
        products[key] = el.including.map(name => name.shopify_title.replace(/^- ?/, ''));
        const emptykey = el.box.toLowerCase().replace(/ /g, '-') + '-empty';
        columns.push(
          { header: el.box, key: key, width: 40 }
        );
        rowkeys.push(key);
        columns.push(
          { header: el.order_count, key: emptykey, width: 4 }
        );
        rowkeys.push(emptykey);
      } else {
        customBoxCount += el.order_count;
      };
    });

    // find elements common to all and store in 'common'
    const arraySet = Object.values(products);
    arraySet.sort((a, b) => (a.length > b.length) ? 1 : -1);
    const smallest = arraySet[0];
    let common = arraySet[0];
    const therest = arraySet.slice(1);
    therest.forEach(arr => {
      const intersect = arr.filter(x => smallest.includes(x));
      common = common.filter(x => intersect.includes(x));
    });
    common.sort();

    Object.keys(products).forEach(key => {
      // add common to the rows
      // split out bread and apples
      const fruit = products[key].filter(el => isFruit(el));
      const bread = products[key].filter(el => isBread(el));
      const test = [...common, ...fruit, ...bread];
      const vege = products[key]
        .filter(item => !test.includes(item)).sort();
      // in a new array, put common first then sort the rest with empty lines between fruit and bread
      const newSet = [...common, ...vege, false, ...fruit, false, ...bread];
      newSet.forEach((el, index) => {
        if (!(index in rows)) {
          rows[index] = Object();
        };
        if (el) {
          rows[index][key] = el;
        };
      });
    });

    // some meta info
    rows.push({
      [rowkeys[0]]: `Custom Boxes: ${customBoxCount}`
      })
    const total_boxes = data.map(el => el.order_count).reduce(function(a, b){
     return a + b;
    }, 0);
    rows.push({
      [rowkeys[0]]: `Total Boxes: ${total_boxes}`
      })
    worksheet.columns = columns;

    // finally the bread list
    const pickingList = getPickingList(data);

    const breadPicking = Object.keys(pickingList)
      .filter(el => isBread(el))
      .reduce((obj, key) => {
        obj[key] = pickingList[key];
        return obj;
      }, {});

    const holdCount = rows.length;

    rows.push(null);
    Object.keys(breadPicking).forEach(el => {
      rows.push({
        [rowkeys[0]]: el,
        [rowkeys[1]]: breadPicking[el].total
        })
    })

    rows.forEach(el => {
      const row = worksheet.addRow({...el});
      row.font = { name: 'Arial' };
    });

    worksheet.getRow(1).font = {bold: true, name: 'Arial'};
    worksheet.getRow(holdCount).font = {bold: true, name: 'Arial'};
    worksheet.getRow(holdCount + 1).font = {bold: true, name: 'Arial'};

    // align center
    for (let i=1; i<=worksheet.actualColumnCount-2; i++) {
      if (i%2 === 0) worksheet.getColumn(i).alignment = {horizontal: 'center'}
    }

    const insideColumns = Array();
    for (var i = 2; i < rowkeys.length; i++) {
          insideColumns.push(String.fromCharCode(i + 64));
    }
    const lastColumn = String.fromCharCode(rowkeys.length + 64);

    // loop through all of the rows and set the outline style.
    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (rowNumber < holdCount -1) {
        worksheet.getCell(`A${rowNumber}`).border = {
          top: {style: 'thin'},
          left: {style: 'thin'},
          bottom: {style: 'thin'},
          right: {style: 'none'}
        };

        insideColumns.forEach((v) => {
          worksheet.getCell(`${v}${rowNumber}`).border = {
            top: {style: 'thin'},
            bottom: {style: 'thin'},
            left: {style: 'thin'},
            right: {style: 'none'}
          }
        });

        worksheet.getCell(`${lastColumn}${rowNumber}`).border = {
          top: {style: 'thin'},
          left: {style: 'thin'},
          bottom: {style: 'thin'},
          right: {style: 'thin'}
        };
      }
    });

    let fileName = `packing-sheet-${deliveryDay.replace(/ /g, '-').toLowerCase()}.xlsx`; // The name of the spreadsheet
    if (Object.hasOwnProperty.call(query, 'pickup')) {
      const testDate = new Date(query.pickup);
      fileName = (testDate === NaN) ? fileName :  `packing-sheet-${testDate.toDateString().replace(/ /g, '-').toLowerCase()}.xlsx`;
    };

    res.writeHead(200, {
      'Content-Type': 'application/octet-stream',
      'Content-disposition': `attachment; filename=${fileName}`
    })
    workbook.xlsx.write(res).then(function(){
      res.end();
    });
  });
};

exports.downloadPickingList = async function (req, res, next) {

  const deliveryDay = getNZDeliveryDay(req.params.timestamp);
  const fullBoxes = await req.app.locals.boxCollection.find({ delivered: deliveryDay}).toArray();
  // slim down array to the essentials i.e. just the title and included products
  const boxes = fullBoxes.map(el => ({box: el.shopify_sku, including: el.includedProducts}));
  const query = getQueryFilters(req, {delivered: deliveryDay});
  const final = getBoxPromises(boxes, query, req.app.locals.orderCollection);

  const getData = async (map) => {
    return Promise.all(map);
  }

  getData(final).then(data => {
    const workbook = new Excel.Workbook();
    const worksheet = workbook.addWorksheet('Picking');

    data = data.filter(el => el.order_count !== 0);
    const pickingList = getPickingList(data);

    worksheet.columns = [
      { header: 'Item', key: 'item', width: 44 },
      { header: 'Standard', key: 'standard', width: 8 },
      { header: 'Extras', key: 'extras', width: 8 },
      { header: 'Total', key: 'total', width: 8 },
    ];

    const productKeys = Object.keys(pickingList);
    const fruit = productKeys.filter(el => isFruit(el)).sort();
    const bread = productKeys.filter(el => isBread(el)).sort();
    const vege = productKeys
      .filter(item => ![...fruit, ...bread].includes(item)).sort();

    const pushRow = (key) => {
      const row = worksheet.addRow(
        {
          'item': key,
          'standard': pickingList[key].standard,
          'extras': pickingList[key].extras,
          'total': pickingList[key].total
        }
      );
      [1, 2, 3].forEach(num => row.getCell(num).font = { name: 'Arial' });
      row.getCell(4).font = { bold: true, name: 'Arial' };
    }
    bread.forEach(key => pushRow(key));
    worksheet.addRow(null);
    fruit.forEach(key => pushRow(key));
    worksheet.addRow(null);
    vege.forEach(key => pushRow(key));

    worksheet.getRow(1).font = {bold: true, name: 'Arial'};

    // align center
    for (let i=2; i<=worksheet.actualColumnCount; i++) {
      worksheet.getColumn(i).alignment = {horizontal: 'center'}
    }

    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      worksheet.getCell(`A${rowNumber}`).border = {
        top: {style: 'thin'},
        left: {style: 'thin'},
        bottom: {style: 'thin'},
        right: {style: 'none'}
      };

      ['B', 'C'].forEach((v) => {
        worksheet.getCell(`${v}${rowNumber}`).border = {
          top: {style: 'thin'},
          bottom: {style: 'thin'},
          left: {style: 'thin'},
          right: {style: 'none'}
        }
      });

      worksheet.getCell(`D${rowNumber}`).border = {
        top: {style: 'thin'},
        left: {style: 'thin'},
        bottom: {style: 'thin'},
        right: {style: 'thin'}
      };
    });

    let fileName = `picking-sheet-${deliveryDay.replace(/ /g, '-').toLowerCase()}.xlsx`; // The name of the spreadsheet
    if (Object.hasOwnProperty.call(query, 'pickup')) {
      const testDate = new Date(query.pickup);
      fileName = (testDate === NaN) ? fileName :  `picking-sheet-${testDate.toDateString().replace(/ /g, '-').toLowerCase()}.xlsx`;
    };

    res.writeHead(200, {
          'Content-Type': 'application/octet-stream',
          'Content-disposition': `attachment; filename=${fileName}`
        })
    workbook.xlsx.write(res).then(function(){
      res.end();
    });
  });
};

