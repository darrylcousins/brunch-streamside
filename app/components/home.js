/** @jsx createElement */
import {createElement, Fragment} from '@bikeshaving/crank/cjs';
import Fetch from './lib/fetch';
import CurrentBoxes from './partials/boxes';
import CurrentOrders from './partials/orders';
import Button from './partials/button';

const SyncBoxes = async () => {
  const { error, json } = await Fetch('/api/sync-boxes');
  console.log('error', error, 'json',  json);
};

module.exports = function () {
  this.addEventListener("click", async (ev) => {
    if (ev.target.tagName === "BUTTON" && ev.target.id === 'sync-boxes') {
      SyncBoxes();
    }
  });
  return (
    <Fragment>
      <h2 class="lh-title">Box Management</h2>
    </Fragment>
  )
};
