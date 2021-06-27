'use strict';

/**
  * @module api/products
  * Api to search products from store for adding to a box
  */

const { ObjectID } = require('mongodb');
const {
  makeShopQuery,
} = require('./lib');
const {
  getNZDeliveryDay,
} = require('./order-lib');

/*
 * function getCoreBox
 * Get the core box if it exists
 */
exports.getCoreBox = async function (req, res, next) {
  // get core box
  const collection = req.app.locals.boxCollection;
  const response = Array();
  try {
    const box = await collection.findOne({ delivered: 'Core Box' });
    res.status(200).json(box);
  } catch(e) {
    res.status(400).json({ error: e.toString() });
  };
};

/*
 * function deleteCoreBox
 * Delete a core box, no parameters from req.body:
 */
exports.deleteCoreBox = async function (req, res, next) {
  _logger.info(JSON.stringify(req.body, null, 2));

  const delivered = "Core Box";
  const collection = req.app.locals.boxCollection;
  try {
    await collection.deleteOne({delivered}, (e, result) => {
      res.status(200).json(result);
    });
  } catch(e) {
    res.status(400).json({ error: e.toString() });
  };
};

/*
 * function createCoreBox
 * Create a core box, no parameters from req.body:
 */
exports.createCoreBox = async function (req, res, next) {
  _logger.info(JSON.stringify(req.body, null, 2));

  const delivered = "Core Box";
  const collection = req.app.locals.boxCollection;
  const doc = {
    _id: new ObjectID(),
    delivered,
    addOnProducts: [],
    includedProducts: []
  };
  const insertResult = await collection.insertOne(doc);
  _logger.info(
    `${insertResult.insertedCount} documents were inserted with the _id: ${insertResult.insertedId}`,
  );
  res.status(200).json(doc);
};

/*
 * function duplicateBoxes
 * Duplicate a set of boxes, parameters from req.body:
 * @param boxes A list of box shopify_sku's
 * @param delivered Date object
 */
exports.duplicateBoxes = async function (req, res, next) {
  _logger.info(JSON.stringify(req.body, null, 2));

  // collect the boxes by date
  const collection = req.app.locals.boxCollection;
  const deliveryDay = getNZDeliveryDay(new Date(req.body.currentDate).getTime());
  const delivered = getNZDeliveryDay(new Date(req.body.delivered).getTime());
  try {
    collection.find({ delivered: deliveryDay })
      .toArray((err, result) => {
        if (err) throw err;
        const boxes = result.filter(el => req.body.boxes.includes(el.shopify_sku));
        const foundBoxes = []; // collect found boxes and report back to form!
        boxes.forEach(boxDoc => {
          collection.findOne({ delivered, shopify_sku: boxDoc.shopify_sku }, async (e, box) => {
            if (e) _logger.info(`Got error ${e}`);
            if (!box) {
              boxDoc.delivered = delivered;
              boxDoc._id = new ObjectID();
              boxDoc.addOnProducts = boxDoc.addOnProducts.map(prod => {
                prod._id = new ObjectID();
                return prod;
              });
              boxDoc.includedProducts = boxDoc.includedProducts.map(prod => {
                prod._id = new ObjectID();
                return prod;
              });
              boxDoc.active = false; // default to inactive
              _logger.info(`Inserting ${JSON.stringify(boxDoc, null, 2)}`);
              await collection.insertOne(boxDoc);
            };
          });
        });
        res.status(200).json(req.body);
      });
  } catch(e) {
    res.status(400).json({ error: e.toString() });
  };
};

/*
 * function removeBox
 * Remove a box, parameters from req.body:
 * @param shopify_product_id shopify_product_id of the box from mongo
 * @param delivered delivery day as string
 *
 */
exports.removeBox = async function (req, res, next) {
  _logger.info(JSON.stringify(req.body, null, 2));

  const collection = req.app.locals.boxCollection;
  collection.findOne(req.body, async (e, box) => {
    if (e) _logger.info(`Got error ${e}`);
    await collection.deleteOne({_id: ObjectID(req.body._id)}, (e, result) => {
      res.status(200).json(result);
    });
  });
  //res.status(202).json({error: 'This will be the error to show'});
};

/*
 * function removeBoxes
 * Remove all boxes for a delivery date, parameters from req.body:
 * @param delivered delivery day as string
 *
 */
exports.removeBoxes = async function (req, res, next) {
  _logger.info(JSON.stringify(req.body, null, 2));

  const collection = req.app.locals.boxCollection;
  const { delivered } = req.body;
  const query = {delivered};
  const response = Object();
  try {
    collection.deleteMany(query, (err, result) => {
      if (err) throw err;
      _logger.info(`Removing boxes: ${result.result.n} objects deleted`);
      res.status(200).json({ count: result.result.n });
    });
  } catch(e) {
    _logger.warn(e.toString());
    res.status(400).json({ error: e.toString() });
  };
};

/*
 * function addBox
 * Add a  box, parameters from req.body:
 * @param shopify_product_id Id of the box from mongo
 * @param delivered Date object
 * @param useCoreBox Boolean - duplicate the core box?
 */
exports.addBox = async function (req, res, next) {
  _logger.info(JSON.stringify(req.body, null, 2));

  const {delivered, shopify_product_id, useCoreBox} = req.body;
  const deliveryDay = getNZDeliveryDay(new Date(delivered).getTime());

  // before adding check that the box is not already created for this delivery date
  const collection = req.app.locals.boxCollection;
  const result = await collection.findOne({ delivered: deliveryDay, shopify_product_id })
  if (result) {
    res.status(202).json({error: `${deliveryDay} already has ${result.shopify_sku}`});
    return;
  };

  let coreBox;

  if (useCoreBox) {
    try {
      coreBox = await collection.findOne({ delivered: "Core Box" });
      _logger.info("Found the core box");
    } catch(e) {
      _logger.info("Error looking for core box");
    };
  };

  // first collect the product details from shopify
  const shop = "SD";
  const path = "products.json";
  const fields = ["id", "title", "handle", "sku", "variants"];
  const limit = 3;
  const query = [
    ["ids", shopify_product_id.toString()]
  ];

  const makeDoc = (product) => {
    return {
      _id: new ObjectID(),
      delivered: deliveryDay,
      shopify_title: product.title,
      shopify_sku: product.title,
      shopify_handle: product.handle,
      shopify_product_id: product.id,
      shopify_variant_id: product.variants[0].id,
      shopify_price: parseFloat(product.variants[0].price) * 100,
      addOnProducts: [],
      includedProducts: [],
      active: false,
    }
  };

  const productDoc = await makeShopQuery({shop, path, limit, query, fields})
    .then(async ({products}) => {
      if (products.length === 0) {
        _logger.info('no product found on shop');
        return null;
      } else if (products.length > 1) {
        _logger.info('more than one product found on shop');
        return null;
      } else {
        return makeDoc(products[0]);
      }
    });

  if (coreBox) {
    productDoc.addOnProducts = coreBox.addOnProducts.map(prod => {
      prod._id = new ObjectID();
      return prod;
    });
    productDoc.includedProducts = coreBox.includedProducts.map(prod => {
      prod._id = new ObjectID();
      return prod;
    });
  };

  const insertResult = await collection.insertOne(productDoc);
  _logger.info(
    `${insertResult.insertedCount} documents were inserted with the _id: ${insertResult.insertedId}`,
  );
  res.status(200).json(productDoc);
};

/*
 * function addProductToBox
 * Add a product to the box, parameters from req.body:
 * @param box_id Id of the box from mongo
 * @param shopify_product_id of the product from shopify
 * @param product_type includedProducts or addOnProducts
 */
exports.addProductToBox = async function (req, res, next) {
  _logger.info(JSON.stringify(req.body, null, 2));

  const {box_id, shopify_product_id, product_type} = req.body;

  // first collect the product details from shopify
  const shop = "SD";
  const path = "products.json";
  const fields = ["id", "title", "handle", "variants"];
  const limit = 3;
  const query = [
    ["ids", shopify_product_id.toString()]
  ];

  const makeDoc = (product) => {
    return {
      _id: new ObjectID(),
      shopify_title: product.title,
      shopify_handle: product.handle,
      shopify_product_id: product.id,
      shopify_variant_id: product.variants[0].id,
      shopify_price: parseFloat(product.variants[0].price) * 100
    }
  };

  const productDoc = await makeShopQuery({shop, path, limit, query, fields})
    .then(async ({products}) => {
      if (products.length === 0) {
        _logger.info('no product found on shop');
        return null;
      } else if (products.length > 1) {
        _logger.info('more than one product found on shop');
        return null;
      } else {
        return makeDoc(products[0]);
        // insert product to the array
      }
    });

  _logger.info(JSON.stringify(productDoc, null, 2));

  if (productDoc) {
    const pushCmd = {}; // construct here to use product_type string
    pushCmd[product_type] = productDoc;

    const collection = req.app.locals.boxCollection;
    collection.updateOne(
      {_id: ObjectID(box_id)},
      {$push: pushCmd}
      , async (e, result) => {
      if (e) _logger.info(`Got error ${e}`);
      _logger.info(JSON.stringify(result, null, 2));

      res.status(200).json(result);
    });
  } else {
      res.status(202).json({error: "Unable to add product"});
  }
};

/*
 * function removeProductFromBox
 * Remove a product from the box, parameters from req.body:
 * @param box_id The objectId of the box from mongo
 * @param shopify_product_id of the product from shopify
 * @param product_type includedProducts or addOnProducts
 */
exports.removeProductFromBox = async function (req, res, next) {
  _logger.info(JSON.stringify(req.body, null, 2));

  const {box_id, shopify_product_id, product_type} = req.body;

  const pullCmd = {}; // construct here to use product_type string
  pullCmd[product_type] = {shopify_product_id};

  const collection = req.app.locals.boxCollection;
  collection.updateOne(
    {_id: ObjectID(box_id)},
    {$pull: pullCmd}
    , async (e, result) => {
    if (e) _logger.info(`Got error ${e}`);
    _logger.info(JSON.stringify(result, null, 2));

    res.status(200).json(result);
  });
};

/*
 * function toggleBoxActive
 * Remove a product from the box, parameters from req.body:
 * @param box_id The objectId of the box from mongo // optional, update one
 * @param delivered Delivery date // optional, update many
 * @param active {boolean} Required
 */
exports.toggleBoxActive = async function (req, res, next) {
  _logger.info(JSON.stringify(req.body, null, 2));

  const {box_id, delivered, active} = req.body;
  const collection = req.app.locals.boxCollection;

  if (box_id && !delivered) {
    collection.updateOne(
      {_id: ObjectID(box_id)},
      {$set: {active}}
      , async (e, result) => {
      if (e) _logger.info(`Got error ${e}`);
      _logger.info(JSON.stringify(result, null, 2));

      res.status(200).json(result);
    });
  } else if (!box_id && delivered) {
    collection.updateMany(
      {delivered},
      {$set: {active}}
      , async (e, result) => {
      if (e) _logger.info(`Got error ${e}`);
      _logger.info(JSON.stringify(result, null, 2));

      res.status(200).json(result);
    });
  }
};

/*
 * function queryStore
 * helper method for queryStoreProducts and queryStoreBoxes
 * expects a string to search on and product_type to filter by
 */
const queryStore = async function (search, product_type) {

  const shop = "SD"; // which store?? this is set in .env and global _env object
  const path = "products.json";
  const fields = ["id", "title"];
  const limit = 100; // need to sort out paging, perhaps using 'since_id', not so successful, just relying on search terms
  const query = [
    ["product_type", product_type],
    ["status", "active"],
  ];

  return await makeShopQuery({shop, path, limit, query, fields})
    .then(async ({products}) => {
      return products.filter(({title}) => new RegExp(search, 'gi').test(title));
    });
};

/*
 * function queryStoreProducts
 * expects a string to search on
 */
exports.queryStoreProducts = async function (req, res, next) {
  _logger.info(JSON.stringify(req.body, null, 2));

  let search = "";
  if (req.body.search) search = req.body.search;

  try {
    const result = await queryStore(search, "Box Produce");
    res.status(200).json(result);
  } catch(e) {
    res.status(400).json({ error: e.toString() });
  };

};

/*
 * function queryStoreBoxes
 * expects a string to search on
 */
exports.queryStoreBoxes = async function (req, res, next) {
  _logger.info(JSON.stringify(req.body, null, 2));

  let search = "";
  if (req.body.search) search = req.body.search;

  try {
    const result = await queryStore(search, "Container Box");
    res.status(200).json(result);
  } catch(e) {
    res.status(400).json({ error: e.toString() });
  };

};
