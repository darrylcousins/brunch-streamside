'use strict';

const { processOrder, getFetch } = require('./lib');

exports.headersPartial = [
  'Box',
  'Delivery Day',
  'Order #',
  'Suburb',
  'City',
  'Postcode',
  'Telephone'
]


/*
 * fetch methods
 */

exports.orderPartialQuery = (id) =>  `
{
  order(id: "${id}") {
    id
    name
    note
    customer {
      email
    }
    shippingAddress {
      phone
      address2
      city
      zip
    }
    lineItems(first: 10) {
      edges {
        node {
          sku
          customAttributes {
            key
            value
          }
        }
      }
    }
  }
}`;

//const QUERY = 'query { shop { id name email } }';
exports.getIds = () => {
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

exports.getRow = async (id, pickingList, deliveryDay, orderQuery) => {
  return await getFetch(orderQuery(id))
    .then(response => response.json())
    .then(json => {
      // should throw here to catch errors
      if (json.errors) console.log('getCurrentOrders', json.errors);
      //const partial = (typeof deliveryDay === null && pickingList !== null);  // only partial attributes are required if not delivery day
      const partial = !(pickingList === null && (deliveryDay !== null));
      return processOrder(json.data.order, pickingList, partial, deliveryDay);
    });
};


