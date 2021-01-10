'use strict';

require('dotenv').config();
const Pool = require('pg').Pool;

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

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
      res.rows.forEach((row) => {
        let boxDoc = row;
        let boxId = boxDoc.id;
        delete boxDoc.id;
        // figure out the unique doc identifier: timestamp in days + shopify_product_id
        boxDoc._id = (boxDoc.delivered.getTime()/(1000 * 60 * 60 * 24)).toString() + boxDoc.shopify_product_id;

        // get box products
        pool
          .query(boxProducts, [boxId, 't'])
          .then(res => {
            boxDoc.addOnProducts = res.rows;
            pool
              .query(boxProducts, [boxId, 'f'])
              .then(res => {
                boxDoc.includedProducts = res.rows;
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

module.exports = async function (req, res, next) {
  const boxDocuments = await collectBoxes();
  const collection = req.app.locals.boxCollection;
  // insert into mongodb
  collection.insertMany(boxDocuments)
    .then(result => {
      res.status(200).json({ success: 'success' });
    })
    .catch(e => {
      res.status(400).json({ error: e.toString() });
    });
};
