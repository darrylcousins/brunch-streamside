/** @jsx createElement */
/**
 * Creates element to render html display of order details
 *
 * @module app/components/order-detail
 * @exports OrderDetail
 */
import { createElement } from "@bikeshaving/crank/cjs";

/**
 * Create a DOM representation of order properties.
 *
 * @function
 * @returns {Element} DOM element displaying order detail
 * @param {object} props Property object
 * @param {object} props.order The order to be displayed
 */
function OrderDetail({ order }) {
  return (
    <div class="dt-ns dt--fixed-ns">
      <div class="dtc-ns pv4">
        <article class="bg-white center">
          <div class="ph3">
            <h1 class="f4 f4-ns fw6 mid-gray">{order.sku}</h1>
            <h2 class="f5 gray fw2 ttu">{order.delivered}</h2>
            {order.order_number && (
              <h3 class="f6 gray fw2 ttu tracked">
                Order # {order.order_number}
              </h3>
            )}
          </div>
          <div class="ph3">
            <span class="b gray db pv1">{order.name}</span>
            <span class="gray db pv1">{order.address1}</span>
            <span class="gray db pv1">{order.address2}</span>
            <span class="gray db pv1">
              {order.city} {order.zip}
            </span>
            <span class="gray db pv1">{order.phone}</span>
            <span class="gray db pv1">{order.contact_email}</span>
          </div>
          <h3 class="f6 gray fw2 ttu tracked">{order.source}</h3>
          <div class="ph3">{order.note}</div>
        </article>
      </div>
      <div class="dtc-ns pv4">
        <h1 class="f4 f4-ns fw6 mid-gray tracked">Includes</h1>
        <div>
          {order.including.length === 0 ? (
            <span class="gray db pv1">None</span>
          ) : (
            order.including.map((el) => <span class="gray db pv1">{el}</span>)
          )}
        </div>
      </div>
      <div class="dtc-ns pv4">
        <h1 class="f4 f4-ns fw6 mid-gray tracked">Extras</h1>
        <div>
          {order.addons.length === 0 ? (
            <span class="gray db pv1">None</span>
          ) : (
            order.addons.map((el) => <span class="gray db pv1">{el}</span>)
          )}
        </div>
      </div>
      <div class="dtc-ns pv4">
        <h1 class="f4 f4-ns fw6 mid-gray tracked">Excluding</h1>
        <div>
          {order.removed.length === 0 ? (
            <span class="gray db pv1">None</span>
          ) : (
            order.removed.map((el) => <span class="gray db pv1">{el}</span>)
          )}
        </div>
      </div>
    </div>
  );
}

export default OrderDetail;
