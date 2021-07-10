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
 * The checkbox to select items when clicked is picked up by orders-current event listener
 *
 * @function
 * @returns {Element} DOM element displaying order detail
 * @param {object} props Property object
 * @param {object} props.order The order to be displayed
 * @param {number} props.index The index of the row
 */
function* TableRow({ order, index, selected }) {

  for ({ order, index, selected } of this) {

    const name = (order.name === "") ? `${order.first_name} ${order.last_name}` : order.name;

    yield (
      <tr crank-key={order._id}>
        <td data-title="Select" class="pv1 bb b--black-20 v-top">
          <input
            type="checkbox"
            name="order[]"
            id={order._id}
          />
        </td>
        <td data-title="SKU" class="pv1 bb b--black-20 v-top">{order.sku}</td>
        <td data-title="Delivered" class="pv1 bb b--black-20 v-top">{order.delivered}<span class="db black-40">({order.pickup})</span></td>
        <td data-title="Order #" class="pv1 bb b--black-20 v-top">{order.order_number}</td>
        <td data-title="Contact" class="pv1 bb b--black-20 v-top">
          <span class="db">{name}</span>
          <span class="db">{order.phone}</span>
          <span class="db">{order.contact_email}</span>
        </td>
        <td data-title="Address" class="pv1 bb b--black-20 v-top">
          <span class="db">{order.address1}</span>
          <span class="db">{order.address2}</span>
          <span class="db">{order.city}</span>
          <span class="db">{order.zip}</span>
        </td>
        <td data-title="Source" class="pv1 bb b--black-20 v-top">{order.source}</td>
        <td data-title="Actions" class="pv1 bb b--black-20 v-top tr-l">
          <OrderModal crank-key={index} order={order} />
          <EditOrderModal order={order} delivered={order.delivered} />
          <RemoveOrderModal order={order} />
        </td>
      </tr>
    );
  };
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
        <th class="fw6 bb b--black-20 tl pv3 bg-white sticky">{item}</th>
      ))}
      <th class="fw6 bb b--black-20 tl pv3 bg-white sticky" aria-label="Empty" />
    </tr>
  </thead>
);

/**
 * Create a DOM representation of table body
 *
 * @generator
 * @yeilds {Element} DOM element displaying order detail
 * @param {object} props Property object
 * @param {Array} props.orders Array of orders
 */
function* TableBody({ orders, selected }) {

  for ({ orders, selected } of this) {
    const sortedOrders = sortObjectByKey(orders, "sku");
    yield (
      <tbody class="lh-copy" id="orders-table">
        {sortedOrders.map((order, index) => (
          <TableRow index={index} order={order} selected={selected} />
        ))}
      </tbody>
    );
  };
};

export { TableHeader, TableBody, TableRow };
