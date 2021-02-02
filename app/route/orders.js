/** @jsx createElement */
/**
 * Starting point of url route /orders
 *
 * @module app/route/order
 * @exports Orders
 * @requires module:app/orders-current
 * @requires module:app/orders-upload
 * @author Darryl Cousins <darryljcousins@gmail.com>
 */
import { createElement, Fragment } from "@bikeshaving/crank/cjs";
import CurrentOrders from "../components/partials/orders-current";
import UploadOrders from "../components/partials/orders-upload";

/**
 * Route to orders, linked from navigation
 *
 * @function
 * @returns {Element} DOM component
 * @example
 * import {renderer} from '@bikeshaving/crank/cjs/dom';
 * renderer.render(<Orders />, document.querySelector('#app'))
 */
function Orders() {
  return (
    <Fragment>
      <div class="tr db">
        <UploadOrders />
      </div>
      <CurrentOrders />
    </Fragment>
  );
}

export default Orders;
