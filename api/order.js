'use strict';

require('dotenv').config();
require('isomorphic-fetch');
const { getFetch, processOrder } = require('./lib');

exports.headersFull = [
  'Logo',
  'Box',
  'Delivery Day',
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

/*
 * queries
 */

exports.orderFullQuery = (id) =>  `
{
  order(id: "${id}") {
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
    lineItems(first: 10) {
      edges {
        node {
          ${ /*
          id
          name
          */`` }
          sku
          ${ /*
          product {
            id
            productType
            handle
            title
          }
          quantity
          */`` }
          customAttributes {
            key
            value
          }
        }
      }
    }
  }
}`;

exports.getOrder = async (id, orderQuery) => {
  const gid = `gid://shopify/Order/${id}`;
  return await getFetch(orderQuery(gid))
    .then(response => response.json())
    .then(json => {
      // should throw here to catch errors
      if (json.errors) console.log('getOrder', json.errors);
      const partial = false;  // full attributes are required
      const pickingList = null; // picking list not required
      return processOrder(json.data.order, pickingList, partial, null);
    });
};
