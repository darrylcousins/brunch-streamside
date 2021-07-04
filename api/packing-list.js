'use strict';
const MongoClient = require('mongodb').MongoClient;
const Excel = require('exceljs');
const {
  getNZDeliveryDay,
} = require('./order-lib');
const {
  getBoxPromises,
  isFruit,
  isBread,
  getQueryFilters,
} = require('./lib');

const getPickingList = (data) => {
  const picking = Object();
  data.forEach(box => {
    box.including.forEach(el => {
      const product = el.shopify_title.replace(/^- ?/, '');
      if (!picking.hasOwnProperty(product)) {
        picking[product] = Object();
      }
      if (!picking[product].hasOwnProperty('standard')) {
        picking[product].standard = 0;
      }
      if (!picking[product].hasOwnProperty('total')) {
        picking[product].total = 0;
      }
      picking[product].standard += box.order_count;
      picking[product].total += box.order_count;
    });
    Object.keys(box.extras).forEach(key => {
      const product = key.replace(/^- ?/, '');
      if (!picking.hasOwnProperty(product)) {
        picking[product] = Object();
      }
      if (!picking[product].hasOwnProperty('extras')) {
        picking[product].extras = 0;
      }
      if (!picking[product].hasOwnProperty('total')) {
        picking[product].total = 0;
      }
      picking[product].extras += box.extras[key];
      picking[product].total += box.extras[key];
    });
  });
  return picking;
}

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

