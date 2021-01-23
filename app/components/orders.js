/** @jsx createElement */
import { createElement, Fragment } from "@bikeshaving/crank/cjs";
import CurrentOrders from "./partials/orders-current";
import UploadOrders from "./partials/orders-upload";

export default function Orders() {
  return (
    <Fragment>
      <div class="tr db">
        <UploadOrders />
      </div>
      <CurrentOrders />
    </Fragment>
  );
}
