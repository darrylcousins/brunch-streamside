'use-strict';

require('dotenv').config();
require('isomorphic-fetch');
const xlsx = require('xlsx');
const { parse } = require('@fast-csv/parse');

const LABELKEYS = [
  'Delivery Date', 
  'Including', 
  'Add on items', 
  'Removed items', 
  'Subscription',
  'Add on product to',
  'ShopID',
];

const NODELIVER_STRING = "No delivery date";

const orderFields = {
  'Box': 'text',
  'Order #': 'number',
  'First Name': 'text',
  'Last Name': 'text',
  'Address Line': 'text',
  'Suburb': 'text',
  'City': 'text',
  'Postcode': 'number',
  'Email': 'email',
  'Telephone': 'text',
  'Source': 'text',
  'Delivery Note': 'text',
  'Excluding': 'text',
  'Extras': 'text'
};

const headersFull = [
  'Logo',
  'Box',
  'Delivery Day',
  'Order #',
  'Run Id',
  'First Name',
  'Last Name',
  'Address Line',
  'Suburb',
  'City',
  'Postcode',
  'Telephone',
  'Excluding',
  'Extras',
  'Delivery Note',
  'Shop Note',
  'Source'
]

const headersPartial = [
  // 'Select',
  'Box',
  'Delivery Day',
  'Order #',
  'Customer',
  'Shipping',
  'Source'
]

const updateOrderTag = async (id, tags) => {
  // update tags with comma separated string
  const url = `https://${process.env.SHOP_NAME}.myshopify.com/admin/api/${process.env.API_VERSION}/orders/${id}.json`;
  return await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': process.env.SHOPIFY_API_PASSWORD 
    },
    body: JSON.stringify({ order: { id, tags }}),
  })
    .then(response => response)
    .then(data => data);
  _logger.info(`Updated order ${id} with tag ${tags}`);
};

const mongoRemove = async (collection, data) => {
  const { _id, ...parts } = data;
  return await collection.deleteOne(
    { _id }
  );
};

const mongoUpdate = async (collection, data) => {
  const { _id, ...parts } = data;
  return await collection.updateOne(
    { _id },
    { $set: { ...parts } },
    { upsert: false }
  );
};

const mongoInsert = async (collection, data) => {
  const { _id, ...parts } = data;
  return await collection.updateOne(
    { _id },
    { $setOnInsert: { ...parts } },
    { upsert: true }
  );
};

const insertOrder = (collection, data) => {
  const { _id, ...parts } = data;
  collection.updateOne(
    { _id },
    { $setOnInsert: { ...parts } },
    { upsert: true }
  );
};

const getNZDeliveryDay = (timestamp) => {
  const d = new Date(parseInt(timestamp)).toLocaleString("en-NZ", {timeZone: "Pacific/Auckland"});
  const parts = d.split(',')[0].split('/');
  const dateString = `${parts[1]}/${parts[0]}/${parts[2]}`; // converts say 7/01/2021 to 01/7/2021
  const deliveryDay = new Date(dateString)
    .toDateString(); // results in say Thu Jan 07 2021 as in above example
  return deliveryDay;
};

const matchNumberedString = (str) => {
  // e.g. 'Baby Kale (2)' => 'Baby Kale', 2
  str = str.trim();
  let count = 0;
  const match = str.match(/\(\d+\)$/);
  if (match) {
    count = parseInt(str.slice(match.index+1, match.index+match[0].length-1));
    str = str.slice(0, match.index).trim();
  }
  return { str, count };
};

const processOrderJson = (json) => {
  // process order as received from Shopify api
  const {
    id,
    order_number,
    subtotal_price,
    contact_email,
    shipping_address,
    note,
    line_items,
    customer
  } = json;
  let cust_details = {};
  // TODO destructuring within if else to const didn't work???
  if (shipping_address) {
    cust_details.name = shipping_address.name;
    cust_details.first_name = shipping_address.first_name;
    cust_details.last_name = shipping_address.last_name;
    cust_details.address1 = shipping_address.address1;
    cust_details.address2 = shipping_address.address2;
    cust_details.city = shipping_address.city;
    cust_details.zip = shipping_address.zip;
    cust_details.phone = shipping_address.phone;
  } else {
    cust_details.name = customer.default_address.name;
    cust_details.first_name = customer.first_name;
    cust_details.last_name = customer.last_name;
    cust_details.address1 = customer.default_address.address1;
    cust_details.address2 = customer.default_address.address2;
    cust_details.city = customer.default_address.city;
    cust_details.zip = customer.default_address.zip;
    cust_details.phone = customer.default_address.phone;
  }
  // TODO destructuring within if else to const didn't work???
  const {
    name,
    first_name,
    last_name,
    address1,
    address2,
    city,
    zip,
    phone
  } = cust_details;

  const sku = line_items[0].sku;
  const properties = line_items[0].properties;

  const [deliveryKey, includingKey, addonKey, removedKey, subscriptionKey, boxKey, uidCodeKey] = LABELKEYS;
  var attributes = properties.reduce(
    (acc, curr) => Object.assign(acc, { [`${curr.name}`]: curr.value }),
    {});

  let delivered = NODELIVER_STRING;
  let addons = [];
  let including = [];
  let removed = [];

  if (deliveryKey in attributes) delivered = attributes[deliveryKey];
  if (includingKey in attributes) including = attributes[includingKey]
    .split(',').map(el => el.trim()).filter(el => el !== '');
  if (addonKey in attributes) addons = attributes[addonKey]
    .split(',').map(el => el.trim()).filter(el => el !== '');
  if (removedKey in attributes) removed = attributes[removedKey]
    .split(',').map(el => el.trim()).filter(el => el !== '');

  const result = {
    _id: id,
    order_number,
    sku,
    delivered,
    subtotal_price,
    contact_email,
    name,
    first_name,
    last_name,
    address1,
    address2,
    city,
    zip,
    phone,
    note,
    including,
    addons,
    removed,
    source: 'Shopify'
  };
  return result;
};

const parseNumberedString = (str) => {
  // e.g. '3x Baby Kale' => 'Baby Kale (3)'
  str = str.trim();
  // first remove existing instances of (\d)
  const match1 = str.match(/\(\d+\)$/);
  if (match1) {
    str = str.slice(0, match1.index).trim();
  }
  let count = 0;
  // then match on '3x'
  const match2 = str.match(/^\d+\x/);
  if (match2) {
    str = str.slice(match2.index + match2.length + 1, str.length).trim();
    count = parseInt(match2[0].replace('x', '').trim());
    if (count > 1) {
      str = `${str} (${count})`;
    };
  }
  return str;
};

const skuTranslate = (str) => {
  if (str.toLowerCase().includes('custom')) {
    return 'Custom Box';
  };
  if (str.toLowerCase() === 'medium vege family') {
    return 'Medium Vege';
  };
  return str;
};

const orderImportCSV = (data, delivered, collection) => {
  let json;
  let count = 0;
  let id = new Date().getTime();
  try {
    // note: no Package Number nor Delivery Date
    const stream = parse({ headers: true })
        .on('error', error => _logger.error(error))
        .on('data', row => {
          json = {
            _id: parseInt(id) + count,
            addons: row['Box Extra Line Items']
                      .split(',')
                      .map(el => el.trim())
                      .filter(el => el !== '')
                      .map(el => parseNumberedString(el)),
            address1: `${row['Delivery Address Line 1']}${row['Delivery Address Line 2'] && ' ' + row['Delivery Address Line 2']}`,
            address2: row['Delivery Address Suburb'],
            city: row['Delivery Address City'],
            contact_email: row['Customer Email'],
            delivered,
            including: [],
            first_name: row['Customer First Name'],
            last_name: row['Customer Last Name'],
            name: `${row['Customer First Name']} ${row['Customer Last Name']}`,
            note: row['Delivery Note'],
            order_number: parseInt(row['Order Number']),
            phone: row['Customer Phone'],
            removed: row['Box Dislikes']
                      .split(',')
                      .map(el => el.trim())
                      .filter(el => el !== ''),
            sku: skuTranslate(row['Box Type']),
            subtotal_price: row['Price'],
            zip: row['Delivery Address Postcode'],
            source: 'BuckyBox'
          };
          _logger.info(JSON.stringify(json, null, 2));
          insertOrder(collection, json);
          count += 1;
        })
        .on('end', (rowCount, number) => {
          _logger.info(`Parsed ${rowCount} rows from BuckyBox insert for ${delivered}`);
          count = rowCount;
          return rowCount;
        });
    stream.write(data);
    stream.end();
    return true; // this always return 0 even using 'var'??
  } catch(err) {
    _logger.error(err);
    return false;
  }
};

const findNextWeekday = (day) => {
  // return the date of next Thursday as 14/01/2021 for example
  // Thursday day is 4, Saturday is 6
  let now = new Date();
  now.setDate(now.getDate() + (day + (7-now.getDay())) % 7);
  return now;
};

const getAttribute = (obj, key, def) => {
  if (obj.hasOwnProperty(key)) {
    return obj[key];
  };
  return def;
}

const orderImportXLSX = (data, delivered, collection) => {
  //_logger.error('Not importing because of non-duplicate ids which will make a mess');
  //return false;
  let count = 0;
  let targetDate = new Date(Date.parse(delivered));
  let targetString = targetDate.toLocaleDateString().replace(/-/g, '/').replace(/^0/,'');
  
  try {
    const wb = xlsx.read(data);

    // check through both sheets
    for (let i=0; i<2; i++) {
      // generate array of arrays
      output = xlsx.utils.sheet_to_json(wb.Sheets[wb.SheetNames[i]], {header:1, raw:true, defval:''});
      const headers = output.shift();
      const result = Array();
      output.forEach(row => {
        rowObj = Object();
        row.forEach((el, index) => {
          rowObj[headers[index]] = el;
        });
        result.push(rowObj);
      });
      result.forEach((row, index) => {
        if (row.hasOwnProperty(targetString) && row[targetString] !== '') {
          //_logger.info(JSON.stringify(row, null, 2));
          json = {
            _id: targetDate.getTime() + index,
            addons: getAttribute(row, 'Extras', '')
                      .split('\r\n')
                      .map(el => el.trim())
                      .filter(el => el !== ''),
            address1: row['Address Line'],
            address2: row['Suburb'],
            city: row['City'],
            contact_email: getAttribute(row, 'email', ''),
            delivered,
            including: [],
            first_name: row['First Name'],
            last_name: row['Last Name'],
            name: `${row['First Name']} ${row['Last Name']}`,
            note: getAttribute(row, 'Delivery Note', ''),
            order_number: null,
            phone: getAttribute(row, 'Telephone', '').toString(),
            removed: getAttribute(row, 'Excluding', '')
                      .split('\r\n')
                      .map(el => el.trim())
                      .filter(el => el !== ''),
            sku: row[targetString],
            subtotal_price: '',
            zip: getAttribute(row, 'Postcode', '').toString(),
            shop_note: getAttribute(row, 'Shop Note', ''),
            source: 'CSA'
          };
          insertOrder(collection, json);
          count = count + 1;
          //_logger.info(JSON.stringify(json, null, 2));
        };
      });
    };
    _logger.info(`Parsed ${count} rows from CSA insert for ${delivered}`);
  } catch(err) {
    _logger.error(err);
    return false;
  }
  return { count };
};

module.exports = {
  processOrderJson,
  insertOrder,
  mongoInsert,
  mongoUpdate,
  mongoRemove,
  orderImportCSV,
  orderImportXLSX,
  matchNumberedString,
  getNZDeliveryDay,
  updateOrderTag,
  LABELKEYS,
  NODELIVER_STRING,
  headersPartial,
  headersFull,
  orderFields
};
