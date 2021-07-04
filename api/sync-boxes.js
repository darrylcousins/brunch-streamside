'use strict';

require('dotenv').config();
require('isomorphic-fetch');
const { ObjectID } = require('mongodb');
const {
  mongoInsert
} = require('./order-lib');
const Pool = require('pg').Pool;

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

const getBoxSKU = async (id) => {
  // update tags with comma separated string
  const url = `https://${process.env.SHOP_NAME}.myshopify.com/admin/api/${process.env.API_VERSION}/variants/${id}.json?fields=sku`;
  return await fetch(url, {
    method: 'GET',
    headers: {
      'X-Shopify-Access-Token': process.env.SHOPIFY_API_PASSWORD 
    }
  })
    .then(response => response.json())
    .then(data => data);
};

const currentBoxes = `
  SELECT
        "Boxes".id,
        "Boxes".delivered,
        "ShopifyBoxes".shopify_title,
        "ShopifyBoxes".shopify_handle,
        "ShopifyBoxes".shopify_product_id,
        "ShopifyBoxes".shopify_variant_id,
        "ShopifyBoxes".shopify_price
    FROM "Boxes"
    INNER JOIN "ShopifyBoxes" ON "ShopifyBoxId" = "ShopifyBoxes".id
    WHERE delivered > NOW()
    ORDER BY delivered, shopify_price
`;

const boxProducts = `
  SELECT 
        "Products".shopify_title,
        "Products".shopify_handle,
        "Products".shopify_id,
        "Products".shopify_variant_id,
        "Products".shopify_price
    FROM "BoxProducts"
    INNER JOIN "Products" ON "BoxProducts"."ProductId" = "Products".id
    WHERE "BoxProducts"."BoxId" = $1 AND "BoxProducts"."isAddOn" = $2
    ORDER BY "Products".shopify_title
`;

const makeProductDoc = (el) => {
  delete el.id;
  const prod = {...el};
  prod._id = new ObjectID();
  prod.shopify_product_id = parseInt(el.shopify_id, 10);
  delete prod.shopify_id;
  prod.shopify_variant_id = parseInt(el.shopify_variant_id, 10);
  return prod;
};

const collectBoxes = async () => {
  // Collect current boxes and push into mongodb
  let boxDocuments = [];
  let targetDelivered = "Thu Jul 08 2021";
  await pool
    .query(currentBoxes)
    .then(res => {
      res.rows.forEach(async (row) => {
        let boxDoc = row;
        let boxId = boxDoc.id;
        let delivered = boxDoc.delivered.toDateString();
        console.log(delivered);

        if (delivered !== targetDelivered) return;

        delete boxDoc.id;
        boxDoc._id = new ObjectID();
        boxDoc.delivered = delivered;

        boxDoc.shopify_product_id = parseInt(boxDoc.shopify_product_id, 10);
        boxDoc.shopify_variant_id = parseInt(boxDoc.shopify_variant_id, 10);
        boxDoc.active = true;

        // get box products
        pool
          .query(boxProducts, [boxId, 't'])
          .then(res => {
            boxDoc.addOnProducts = res.rows.map(el => (makeProductDoc(el)));
            pool
              .query(boxProducts, [boxId, 'f'])
              .then(res => {
                boxDoc.includedProducts = res.rows.map(el => (makeProductDoc(el)));
              });
          });
        boxDocuments.push(boxDoc);

      });
    });
  return boxDocuments;
};

const addSKUAndSave = async (boxDocuments, collection) => {
  const final = await boxDocuments.map(async (boxDoc) => {
    const variant = await getBoxSKU(boxDoc.shopify_variant_id.toString())
      .then(res => res.variant.sku);
    boxDoc.shopify_sku = variant;
    await mongoInsert(collection, boxDoc);
    return boxDoc;
  });
  return final;
};

module.exports = async function (req, res, next) {
  const boxDocuments = await collectBoxes();
  const collection = req.app.locals.boxCollection;
  boxDocuments.forEach(async (boxDoc) => {
    const variant = await getBoxSKU(boxDoc.shopify_variant_id.toString())
      .then(res => res.variant.sku);
    boxDoc.shopify_sku = variant;
    boxDoc._id = new ObjectID();
    console.log("boxDoc", boxDoc);
    const res = await req.app.locals.boxCollection.insertOne(boxDoc);

    /*
    const { _id, ...parts } = boxDoc;
    console.log("_id", _id, variant, boxDoc.delivered);
    const res = await collection.updateOne(
      { _id: new ObjectID() },
      { $setOnInsert: { ...parts } },
      { upsert: true }
    );
    */
    _logger.info(res);
  });

  res.status(200).json(res);
};
