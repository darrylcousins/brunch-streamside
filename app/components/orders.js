/** @jsx createElement */
import {createElement, Fragment} from '@bikeshaving/crank/cjs';
import CurrentOrders from './partials/orders';
import UploadOrders from './partials/upload-orders';

module.exports = function () {
  return (
    <Fragment>
      <UploadOrders />
      <CurrentOrders />
    </Fragment>
  )
};

