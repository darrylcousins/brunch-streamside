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
const getFetch = (query) => {
  return fetch(`https://${process.env.SHOP_NAME}.myshopify.com/admin/api/${process.env.API_VERSION}/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': process.env.SHOPIFY_API_PASSWORD 
    },
    body: JSON.stringify({ query: query }),
  })
};

/*
 * fetch methods
 */

//const QUERY = 'query { shop { id name email } }';
const getIds = () => {
  const query = `
    query {
      orders(first:100,
      query: "fulfillment_status:unshipped AND financial_status:paid"
      ) {
        edges {
          node {
            id
          }
        }
      }
    }
  `;

  return getFetch(query)
    .then(res => res.json())
    .then(res => res.data.orders.edges.map(edge => edge.node.id));
};

const exportQuery = `
  order@idx: order(id: "@id") {
    id
    name
    note
    customer {
      email
      phone
      firstName
      lastName
    }
    shippingAddress {
      phone
      address1
      address2
      city
      province
      zip
    }
    lineItems(first: 5) {
      edges {
        node {
          id
          name
          sku
          product {
            id
            productType
            handle
            title
          }
          quantity
          customAttributes {
            key
            value
          }
        }
      }
    }
  }
`;

const getOrders = (query) => {
  return getFetch(query)
    .then(res => res.json())
    .then(res => {
      if (res.data) {
        return res.data;
      } else {
        return res
      }
    });
};

const buildQuery = (ids) => {
  const queries = ids.map((id, idx) => exportQuery
    .replace(`@idx`, idx)
    .replace(`@id`, `${id}`)
    .trim()
  )
  return `
    query fetchData {
      ${queries.join(`\n`)}
    }
  `;
}

const makeThrottledPromise = (promise, count) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      promise
        .then(res => resolve(res))
        .catch(err => reject(err));
    }, 4000*count);
  });
};

const processOrders = (data, deliveryDate) => {
  let rows = [];
  let pickingList = new Map();
  data.forEach(el => {
    if (el.errors) {
      console.log('ERRORS', el.errors);
      return;
    }
    const length = Object.keys(el).length;
    let counter = 0;
    const [deliveryKey, includingKey, addonKey, removedKey, subscriptionKey, boxKey, uidCodeKey] = LABELKEYS;
    for (let j=0; j<length; j++) {
      let order = el[`order${j}`];
      console.log('order;', order.name);
      let addons = [];
      let including = [];
      let removed = [];
      let delivered = '';
      let item = order.lineItems.edges[0].node;
      var properties = item.customAttributes.reduce(
        (acc, curr) => Object.assign(acc, { [`${curr.key}`]: curr.value }),
        {});

      if (deliveryKey in properties) delivered = properties[deliveryKey];
      if (includingKey in properties) including = properties[includingKey]
        .split(',').map(el => el.trim()).filter(el => el !== '');
      if (addonKey in properties) addons = properties[addonKey]
        .split(',').map(el => el.trim()).filter(el => el !== '');
      if (removedKey in properties) removed = properties[removedKey]
        .split(',').map(el => el.trim()).filter(el => el !== '');

      if (delivered === deliveryDate) {
        /*
        including.forEach(el => {
          if (pickingList.has(el)) {
            pickingList.set(el, pickingList.get(el) + 1);
          } else {
            pickingList.set(el, 1);
          }
        });
        */
        addons.forEach(el => {
          let { str, count } = matchNumberedString(el);
          if (count == 0) count = 1;
          if (pickingList.has(str)) {
            pickingList.set(str, pickingList.get(str) + count);
          } else {
            pickingList.set(str, count);
          }
        });
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
      if (order.customer) {
        let customer = order.customer;
        firstName = customer.firstName; 
        lastName = customer.lastName; 
      }
      rows.push([
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
      ]);
    }
  });

  const headers = [
    'Logo',
    'Box',
    'Delivered',
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
    'Shop Note'
  ]

  return { headers, rows, pickingList };
};

module.exports = async () => {
  const ids = await getIds();
  let promises = [];
  var i,j,temparray,chunk = 5;
  for (i=0,j=ids.length; i<j; i+=chunk) {
    temparray = ids.slice(i,i+chunk);
    let query = buildQuery(temparray);
    let count = (i/chunk) + 1;
    promises.push(makeThrottledPromise(getOrders(query), count));
  }
  const deliveryDate = 'Thu Dec 24 2020';
  const deliveryString = deliveryDate.replace(/ /g, '-');

  let orders = await Promise.all(promises)
    .then(data => {
      const { headers, rows, pickingList } = processOrders(data, deliveryDate);
      //console.log(JSON.stringify(rows, null, 2));
      rows.unshift(headers);
      return rows;
      // write to file
      /*
      csv.stringify(rows, {quoted_string: true, delimiter: ';'})
        .pipe(fs.createWriteStream(`data/orders-${deliveryString}.csv`));

      let countRows = [];
      const pickingMapKeys = Array.from(pickingList.keys()).sort(nameSort); 
      pickingMapKeys.forEach(key => {
        const value = pickingList.get(key);
        countRows.push([key, value.toString()]);
      });
      csv.stringify(countRows, {quoted_string: true, delimiter: ';'})
        .pipe(fs.createWriteStream(`data/picking-${deliveryString}.csv`));
      //console.log(JSON.stringify(countRows, null, 2));
      */

    })
    .catch(err => console.log(err));

  return orders;
};
