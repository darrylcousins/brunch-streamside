const {
  matchNumberedString,
} = require('./order-lib');

const isBread = (str) => Boolean(str.match(/bread|bellbird|sourdough/gi));
const isFruit = (str) => Boolean(str.match(/apple/gi));
exports.isBread = isBread;
exports.isFruit = isFruit;

exports.getPickingList = (data) => {
  const picking = Object();
  data.forEach(box => {
    box.including.forEach(product => {
      product = product.replace(/^- ?/, '');
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

exports.getBoxPromises = (boxes, deliveryDay, db) => {
  // return array of Promises to be resolved by Promises.all
  return boxes.map(async el => {
    /* map current boxes to the orders made
     * delivers:
     * 1. order count for each box
     * 2. the extra addon product counts as a sum
     * NOTE return list of promises that need to be resolved - see getData
     */
    const regex = new RegExp(`^${el.box}`)
    const orders = await db.find({
      sku: { $regex: regex },
      delivered: deliveryDay
    }).toArray();
    el.order_count = orders.length;
    //el.box += ` (${orders.length})`; // doing this now in final return 
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
