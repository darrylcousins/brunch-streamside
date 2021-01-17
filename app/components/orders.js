/** @jsx createElement */
import {createElement, Fragment} from '@bikeshaving/crank/cjs';
import {renderer} from '@bikeshaving/crank/cjs/dom';
import CurrentOrders from './partials/orders-current';
import UploadOrders from './partials/orders-upload';
//import SyncOrders from './partials/orders-sync';

//<SyncOrders />

module.exports = function () {

  return (
    <Fragment>
      <div class="tr db">
        <UploadOrders />
      </div>
      <CurrentOrders />
    </Fragment>
  )
};
