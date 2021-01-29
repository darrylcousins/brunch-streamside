'use strict';
const MongoClient = require('mongodb').MongoClient;
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
      // TODO actually not good enough
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

exports.getOrderFields = async function (req, res, next) {
  res.status(200).json(orderFields);
};

exports.deleteOrders = async function (req, res, next) {
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

exports.getCurrentOrders = async function (req, res, next) {
  const collection = req.app.locals.orderCollection;
  const response = Object();
  const finalOrders = Object();
  const boxCounts = Object();
  const boxes = Object();  // later need to read directly from boxes
  //res.status(400).json({ error: 'random message test' });
  //return;
  try {
    collection.find({sku: {$ne: null}}).sort({delivered: -1}).toArray((err, result) => {
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
      return res.status(400).json({ error: 'Could not parse data. Uploaded file should be a csv or xlxs file.' });
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
      return res.status(400).json({ error: 'Import failed. Unable to determine file type.' });
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
          'Content-disposition': `attachment; filename=box-orders-${deliveryDay.replace(/ /g, '-').toLowerCase()}.xlsx`
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
  const final = getBoxPromises(boxes, deliveryDay, req.app.locals.orderCollection);

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
  const final = getBoxPromises(boxes, deliveryDay, req.app.locals.orderCollection);

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
    let customBoxCount;
    const rowkeys = Array();
    
    data.forEach(el => {
      if (!el.box.startsWith('Custom')) {
        const key = el.box.toLowerCase().replace(/ /g, '-');
        products[key] = el.including.map(name => name.replace(/^- /, ''));
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
        customBoxCount = el.order_count;
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

    res.writeHead(200, {
      'Content-Type': 'application/octet-stream',
      'Content-disposition': `attachment; filename=packing-sheet-${deliveryDay.replace(/ /g, '-').toLowerCase()}.xlsx`
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
  const final = getBoxPromises(boxes, deliveryDay, req.app.locals.orderCollection);

  const getData = async (map) => {
    return Promise.all(map);
  }

  getData(final).then(data => {
    const workbook = new Excel.Workbook();
    const worksheet = workbook.addWorksheet('Packing');

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

    res.writeHead(200, {
          'Content-Type': 'application/octet-stream',
          'Content-disposition': `attachment; filename=picking-list-${deliveryDay.replace(/ /g, '-').toLowerCase()}.xlsx`
        })
    workbook.xlsx.write(res).then(function(){
      res.end();
    });
  });
};

