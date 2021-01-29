/** @jsx createElement */
import { createElement, Fragment } from "@bikeshaving/crank/cjs";
import { renderer } from "@bikeshaving/crank/cjs/dom";

import OrderDetail from "./order-detail";
import OrderModal from "./order-modal";
import EditOrderModal from "./order-edit";
import RemoveOrderModal from "./order-remove";
import Button from "../lib/button";

export const sortObjectByKeys = (o) =>
  Object.keys(o)
    .sort()
    .reduce((r, k) => ((r[k] = o[k]), r), {});

export const sortObjectByKey = (o, key) => {
  o.sort((a, b) => {
    var nameA = a[key].toUpperCase(); // ignore upper and lowercase
    var nameB = b[key].toUpperCase(); // ignore upper and lowercase
    if (nameA < nameB) return -1;
    if (nameA > nameB) return 1;
    return 0;
  });
  return o;
};

export const Order = ({ order, index }) => {
  if (order.name === '') {
    order.name = `${order.first_name} ${order.last_name}`;
  }
  return (
    <tr crank-key={order._id} class="striped--near-white">
      <td class="pv1 ph1 bb b--black-20 v-top">{order.sku}</td>
      <td class="pv1 ph1 bb b--black-20 v-top">{order.delivered}</td>
      <td class="pv1 ph1 bb b--black-20 v-top">{order.order_number}</td>
      <td class="pv1 ph1 bb b--black-20 v-top">
        <span class="db">{order.name}</span>
        <span class="db">{order.phone}</span>
        <span class="db">{order.contact_email}</span>
      </td>
      <td class="pv1 ph1 bb b--black-20 v-top">
        <span class="db">{order.address1}</span>
        <span class="db">{order.address2}</span>
        <span class="db">{order.city}</span>
        <span class="db">{order.zip}</span>
      </td>
      <td class="pv1 ph1 bb b--black-20 v-top">{order.source}</td>
      <td class="pv1 ph1 bb b--black-20 v-top">
        <OrderModal crank-key={index} row={order}></OrderModal>
        <EditOrderModal order={order} delivered={order.delivered} />
        <RemoveOrderModal order={order} />
      </td>
    </tr>
  );
};

export const TableHeader = ({ headers, index }) => {
  return (
    <thead>
      <tr crank-key={index}>
        {headers.map((item, index) => (
          <th class="fw6 bb b--black-20 tl pb3 ph1 bg-white">{item}</th>
        ))}
        <th class="fw6 bb b--black-20 tl pb3 ph1 bg-white"></th>
      </tr>
    </thead>
  );
};

export const TableBodyDoh  = ({ orders }) => {
  console.log(orders);
  orders.map(el => console.log(el));
  return <Order order={orders[0]} index={1} />
};

export const TableBody = ({ orders }) => {
  orders.sort((a, b) => {
    var nameA = a["sku"].toUpperCase(); // ignore upper and lowercase
    var nameB = b["sku"].toUpperCase(); // ignore upper and lowercase
    if (nameA < nameB) return -1;
    if (nameA > nameB) return 1;
    return 0;
  });
  return (
    <tbody class="lh-copy">
      {orders.map((order, index) => (
        <Order index={index} order={order} />
      ))}
    </tbody>
  );
};

