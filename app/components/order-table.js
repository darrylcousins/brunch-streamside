/** @jsx createElement */
/**
 * Module providing components of table display of orders used by
 * {@link module:app/components/orders-current~OrdersCurrent|OrdersCurrent}
 *
 * @module app/components/order-table
 * @exports TableHeader
 * @exports TableBody
 * @exports TableRow
 * @author Darryl Cousins <darryljcousins@gmail.com>
 */
import { createElement } from "@bikeshaving/crank/cjs";

import OrderModal from "./order-modal";
import EditOrderModal from "./order-edit";
import RemoveOrderModal from "./order-remove";
import { sortObjectByKey } from "../helpers";

/**
 * Create a DOM representation of order as a table row
 *
 * @function
 * @returns {Element} DOM element displaying order detail
 * @param {object} props Property object
 * @param {object} props.order The order to be displayed
 * @param {number} props.index The index of the row
 */
const TableRow = ({ order, index }) => {
  const name = (order.name === "") ? `${order.first_name} ${order.last_name}` : order.name;
  // to re-add 'select' column to headers see api/order-lib/partialHeaders
  return (
    <tr crank-key={order._id} class="striped--near-white">
      <td class="pv1 ph1 bb b--black-20 v-top" class="dn">
        <input type="checkbox" name="order[]" />
      </td>
      <td class="pv1 ph1 bb b--black-20 v-top">{order.sku}</td>
      <td class="pv1 ph1 bb b--black-20 v-top">{order.delivered}</td>
      <td class="pv1 ph1 bb b--black-20 v-top">{order.order_number}</td>
      <td class="pv1 ph1 bb b--black-20 v-top">
        <span class="db">{name}</span>
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
        <OrderModal crank-key={index} order={order} />
        <EditOrderModal order={order} delivered={order.delivered} />
        <RemoveOrderModal order={order} />
      </td>
    </tr>
  );
};

/**
 * Create a DOM representation of table header
 *
 * @function
 * @returns {Element} DOM element displaying order detail
 * @param {object} props Property object
 * @param {Array} props.headers Array of header titles
 * @param {number} props.index The index of the row
 */
const TableHeader = ({ headers, index }) => (
  <thead>
    <tr crank-key={index}>
      {headers.map(item => (
        <th class="fw6 bb b--black-20 tl pb3 ph1 bg-white">{item}</th>
      ))}
      <th class="fw6 bb b--black-20 tl pb3 ph1 bg-white" aria-label="Empty" />
    </tr>
  </thead>
);

/**
 * Create a DOM representation of table body
 *
 * @function
 * @returns {Element} DOM element displaying order detail
 * @param {object} props Property object
 * @param {Array} props.orders Array of orders
 */
const TableBody = ({ orders }) => {
  const sortedOrders = sortObjectByKey(orders, "sku");
  return (
    <tbody class="lh-copy">
      {sortedOrders.map((order, index) => (
        <TableRow index={index} order={order} />
      ))}
    </tbody>
  );
};

export { TableHeader, TableBody, TableRow };
