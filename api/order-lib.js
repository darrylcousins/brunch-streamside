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

const insertOrder = (collection, order) => {
  const { _id, ...parts } = order;
  collection.updateOne(
    { _id },
    { $setOnInsert: { ...parts } },
    { upsert: true }
  );
};

const mongoInsert = (collection, data) => {
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
    line_items
  } = json;
  const {
    name,
    first_name,
    last_name,
    address1,
    address2,
    city,
    zip,
    phone
  } = shipping_address;
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

  return {
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
  return str;
};

const orderImportCSV = (data, collection) => {
  let json;
  let delivered;
  var count;
  try {
    const stream = parse({ headers: true })
        .on('error', error => _logger.error(error))
        .on('data', row => {
          console.log(row);
          delivered = new Date(Date.parse(row['Delivery Date'])).toDateString();
          json = {
            _id: parseInt(row['Package Number']),
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
          //_logger.info(JSON.stringify(json, null, 2));
          insertOrder(collection, json);
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

const findNextThursday = () => {
  // return the date of next Thursday as 14/01/2021 for example
  // Thursday day is 4
  const thurs = 4;
  let now = new Date();
  now.setDate(now.getDate() + (thurs + (7-now.getDay())) % 7);
  return now;
};

const getAttribute = (obj, key, def) => {
  if (obj.hasOwnProperty(key)) {
    return obj[key];
  };
  return def;
}

const orderImportXLSX = (data, collection) => {
  let count = 0;
  try {
    const wb = xlsx.read(data);
    const thursdayDate = findNextThursday();
    const thursdayString = thursdayDate.toLocaleDateString().replace(/-/g, '/');
    // generate array of arrays
    output = xlsx.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], {header:1});
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
      delivered = thursdayDate.toDateString();
      if (row.hasOwnProperty(thursdayString)) {
        json = {
          _id: thursdayDate.getTime() + index,
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
          sku: row[thursdayString],
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
