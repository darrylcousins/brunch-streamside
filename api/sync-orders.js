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
  return data;
  /*
  const { order } = data;
  return processOrderJson(order);
  */
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
      ${ /* query: "fulfillment_status:unshipped AND financial_status:paid" */`` }
      query: "name:#2019"
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
        'line_items',
        'customer'
      ];
      const url = `https://${process.env.SHOP_NAME}.myshopify.com/admin/api/${process.env.API_VERSION}/${path}?fields=${fields.join(',')}`;
      console.log(url);

      orders.push(await fetchOrder(url));
    };
    const collection = req.app.locals.orderCollection;
    Promise.all(orders).then(values => {
      //console.log(values);
      const result = [];
      values.forEach(order => {
        const res = processOrderJson(order.order);
        _logger.info(JSON.stringify(res, null, 2));
        //insertOrder(collection, res);
        result.push(res);
        //updateOrderTag(res._id.toString(), res.delivered);
      });

      res.set('Content-Type', 'application/json');
      res.write(JSON.stringify(result));
      res.end();
    
    }).catch(err => {
      _logger.info(err);
      res.status(400).json({ error: err.toString() });
      return;
    });
  } catch(e) {
    res.status(400).json({ error: e.toString() });
    return;
  };
};
