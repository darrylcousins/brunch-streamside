'use-strict';

require('dotenv').config();
require('isomorphic-fetch');

const { processOrderJson, insertOrder, updateOrderTag } = require('./order-lib');

const fetchOrder = async (url) => {
  const data = await fetch(url, {
    method: 'GET',
    headers: {
      'X-Shopify-Access-Token': process.env.SHOPIFY_API_PASSWORD 
    }
  })
    .then(response => response.json())
    .then(data => data);
  const { order } = data;
  return processOrderJson(order);
};

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

const getIds = () => {
  const query = `
    query {
      orders(first:100,
      ${ /* successful test comment */`` }
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

module.exports = async function (req, res, next) {
  let orders = Array();
  try {
    const gids = await getIds();
    for (var i=0; i<gids.length; i++) {
      const parts = gids[i].split('/');
      const id = parts[parts.length-1];
      const path = `orders/${ id }.json`;
      const fields = [
        'id',
        'order_number',
        'subtotal_price',
        'contact_email',
        'shipping_address',
        'note',
        'line_items'
      ];
      const url = `https://${process.env.SHOP_NAME}.myshopify.com/admin/api/${process.env.API_VERSION}/${path}?fields=${fields.join(',')}`;

      orders.push(await fetchOrder(url));
    };
    const collection = req.app.locals.orderCollection;
    orders.forEach(order => {
      insertOrder(collection, order);
      _logger.info(JSON.stringify(order, null, 2));
      //updateOrderTag(order._id.toString(), order.delivered);
    });

    res.set('Content-Type', 'application/json');
    res.write(JSON.stringify(orders));
    res.end();
    
  } catch(e) {
    res.status(400).json({ error: e.toString() });
    return;
  };
};
