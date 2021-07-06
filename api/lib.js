'use-strict';

require('isomorphic-fetch');

const {
  matchNumberedString,
} = require('./order-lib');

const isBread = (str) => Boolean(str.match(/bread|bellbird|sourdough/gi));
const isFruit = (str) => Boolean(str.match(/apple|pear/gi));
exports.isBread = isBread;
exports.isFruit = isFruit;

exports.sortObjectByKeys = (o) => Object.keys(o).sort().reduce((r, k) => (r[k] = o[k], r), {});

exports.sortObjectByKey = (o, key) => {
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

exports.conformSKU = (str) => {
  // mixed up titles with Big Veg on Shopify and Big Vege elsewhere
  if (str && str.startsWith('Big')) return 'Big Vege';
  return str;
};

exports.getQueryFilters = (req, query) => {
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

exports.makeShopQuery = async ({path, limit, query, fields}) => {
  const fieldString = fields ? `?fields=${fields.join(',')}` : "";
  const start = fields ? "&" : "?";
  const searchString = query ? start + query.reduce((acc, curr, idx) => {
    const [key, value] = curr;
    return acc + `${ idx > 0 ? "&" : ""}${key}=${value}`;
  }, "") : "";
  const count = limit ? `&limit=${limit}` : "";
  _logger.info(_env.SHOP_NAME);
  
  const url = `https://${_env.SHOP_NAME}.myshopify.com/admin/api/${_env.API_VERSION}/${path}${fieldString}${searchString}${count}`;
  _logger.info(`Query store: ${url}`);
  return await fetch(encodeURI(url), {
    method: 'GET',
    headers: {
      'X-Shopify-Access-Token': _env.API_PASSWORD 
    }
  })
    .then(response => response.json())
};

exports.getBoxPromises = (boxes, query, db) => {
  // return array of Promises to be resolved by Promises.all
  return boxes.map(async el => {
    /* map current boxes to the orders made
     * delivers:
     * 1. order count for each box
     * 2. the extra addon product counts as a sum
     * NOTE return list of promises that need to be resolved - see getData
     */
    const regex = new RegExp(`^${el.box}`)
    query['sku'] = { $regex: regex };
    const orders = await db.find({...query}).toArray();
    el.order_count = orders.length;
    el.extras = Object();
    orders.forEach(order => {
      if (order.addons.length) {
        order.addons.forEach(product => {
          let { str, count } = matchNumberedString(product);
          if (count == 0) count = 1;
          if (!el.extras.hasOwnProperty(str)) {
            el.extras[str] = count;
          } else {
            el.extras[str] += count;
          };
        });
      };
    });
    return el;
  });
}
