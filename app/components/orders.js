/** @jsx createElement */
import {createElement, Fragment} from '@bikeshaving/crank/cjs';
import Fetch from './lib/fetch';
import CurrentOrders from './partials/orders';

module.exports = function () {
  return (
    <CurrentOrders />
  )
};

