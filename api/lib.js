'use strict';

require('dotenv').config();
require('isomorphic-fetch');

const LABELKEYS = [
  'Delivery Date', 
  'Including', 
  'Add on items', 
  'Removed items', 
  'Subscription',
  'Add on product to',
  'ShopID',
];

/*
 * lib methods
 */
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

exports.getFetch = (query) => {
  return fetch(`https://${process.env.SHOP_NAME}.myshopify.com/admin/api/${process.env.API_VERSION}/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': process.env.SHOPIFY_API_PASSWORD 
    },
    body: JSON.stringify({ query: query }),
  })
};

exports.processOrder = (order, pickingList, partial, deliveryDay) => {
  /* Extract product lists from order notes and compile picking lists for the days
  */
  const [deliveryKey, includingKey, addonKey, removedKey, subscriptionKey, boxKey, uidCodeKey] = LABELKEYS;

  let addons = [];
  let including = [];
  let removed = [];
  let delivered = '';
  let item = order.lineItems.edges[0].node;

  var properties = item.customAttributes.reduce(
    (acc, curr) => Object.assign(acc, { [`${curr.key}`]: curr.value }),
    {});

  if (deliveryKey in properties) delivered = properties[deliveryKey];

  // collecting by date for csv export
  if (deliveryDay !== null && (delivered !== deliveryDay && delivered !== '') && !partial) {
    return { row: null, pickingList }; // downloading csv file for particular day
    // i.e. partial is false and delivered does not match
  };

  // collecting picking list for full order collection and display
  if (deliveryDay === null && pickingList) {
    deliveryDay = delivered;
  };

  if (includingKey in properties) including = properties[includingKey]
    .split(',').map(el => el.trim()).filter(el => el !== '');
  if (addonKey in properties) addons = properties[addonKey]
    .split(',').map(el => el.trim()).filter(el => el !== '');
  if (removedKey in properties) removed = properties[removedKey]
    .split(',').map(el => el.trim()).filter(el => el !== '');

  if (pickingList) { // set method argument to null if not required
    /* construct picking list mapped to seperate delivery dates */
    let pick = null;
    if (pickingList.has(delivered)) {
      pick = pickingList.get(delivered);
    } else {
      if (deliveryDay === delivered) {
        pickingList.set(delivered, new Map());
        pick = pickingList.get(delivered);
      };
    };
    if (pick !== null) {
      including.forEach(el => {
        if (pick.has(el)) {
          pick.set(el, pick.get(el) + 1);
        } else {
          pick.set(el, 1);
        }
      });
      addons.forEach(el => {
        let { str, count } = matchNumberedString(el);
        if (count == 0) count = 1;
        if (pick.has(str)) {
          pick.set(str, pick.get(str) + count);
        } else {
          pick.set(str, count);
        }
      });
    };
  }

  let address1 = '';
  let address2 = '';
  let city = '';
  let zip = '';
  let phone = '';
  let firstName = '';
  let lastName = '';
  if (order.shippingAddress) {
    let shipping = order.shippingAddress;
    address1 = shipping.address1; 
    address2 = shipping.address2 ? shipping.address2 : '';
    city = shipping.city; 
    zip = shipping.zip; 
    phone = shipping.phone; 
  }

  let row;

  if (partial) {
    row = [
      item.sku,
      delivered,
      order.name,
      address2,
      city,
      zip,
      phone,
      order.id
    ];
  } else { // either for full order report detail or for csv export file
    if (order.customer) {
      let customer = order.customer;
      firstName = customer.firstName; 
      lastName = customer.lastName; 
    }
    row = [
      '',
      item.sku,
      delivered,
      order.name,
      '',
      firstName,
      lastName,
      address1,
      address2,
      city,
      zip,
      phone,
      removed.join('\n'),
      addons.join('\n'),
      order.note,
      ''
    ];
  };
  return { row, pickingList };
};

