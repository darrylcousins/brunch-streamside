'use strict';

require('dotenv').config();
require('isomorphic-fetch');
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

const collectBoxes = async () => {
  // Collect current boxes and push into mongodb
  let boxDocuments = [];
  await pool
    .query(currentBoxes)
    //.query(productAddOns, [271, 't'])
    .then(res => {
      res.rows.forEach(async (row) => {
        let boxDoc = row;
        let boxId = boxDoc.id;
        delete boxDoc.id;
        // figure out the unique doc identifier: timestamp in days + shopify_product_id
        boxDoc._id = parseInt(boxDoc.delivered.getTime()/(1000 * 60 * 60 * 24) + parseInt(boxDoc.shopify_product_id));
        boxDoc.delivered = boxDoc.delivered.toDateString();

        boxDoc.shopify_product_id = parseInt(boxDoc.shopify_product_id);
        boxDoc.shopify_variant_id = parseInt(boxDoc.shopify_variant_id);

        // get box products
        pool
          .query(boxProducts, [boxId, 't'])
          .then(res => {
            boxDoc.addOnProducts = res.rows.map(el => el.shopify_title);
            pool
              .query(boxProducts, [boxId, 'f'])
              .then(res => {
                boxDoc.includedProducts = res.rows.map(el => el.shopify_title);
              });
          });
        boxDocuments.push(boxDoc);

        // Can convert _id back to the date
        //let milliseconds = parseInt(boxDoc._id.slice(0, 5)) * 1000 * 60 * 60 * 24;
        //console.log(new Date(milliseconds));
      });
    });
  return boxDocuments;
};

const addSKUAndSave = async (boxDocuments, collection) => {
  const final = await boxDocuments.map(async (boxDoc) => {
    const variant = await getBoxSKU(boxDoc.shopify_variant_id.toString())
      .then(res => res.variant.sku);
    boxDoc.shopify_sku = variant;
    console.log(boxDoc);
    await mongoInsert(boxDoc, collection);
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
    //console.log(boxDoc);
    const { _id, ...parts } = boxDoc;
    const res = await collection.updateOne(
      { _id },
      { $setOnInsert: { ...parts } },
      { upsert: true }
    );
    if (res.upsertId) {
      _logger.info(`Inserted box with id: ${res.upsertedId._id}`);
    } else {
      _logger.info(`No box to insert, existing box with _id: ${_id}`);
    }
  });

  res.status(200).json({ success: true });
};
