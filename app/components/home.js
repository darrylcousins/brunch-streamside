/** @jsx createElement */
import {createElement, Fragment} from '@bikeshaving/crank/cjs';
import {renderer} from '@bikeshaving/crank/cjs/dom';
import oboe from 'oboe';
import Loader from './lib/loader';
import Error from './lib/error';
import Fetch from './lib/fetch';

let weekday=new Array(7);
weekday[0]="Sunday";
weekday[1]="Monday";
weekday[2]="Tuesday";
weekday[3]="Wednesday";
weekday[4]="Thursday";
weekday[5]="Friday";
weekday[6]="Saturday";

const Box = ({box, index}) => {
  const deliveryDate = new Date(box.delivered);
  return (
    <tr key={index}>
      <td class="pv3 pr3 bb b--black-20 blue">
        { deliveryDate.toLocaleDateString() }
        <br />
        ({ weekday[deliveryDate.getDay()] })
      </td>
      <td class="pv3 pr3 bb b--black-20">
        <strong>{ box.shopify_title }</strong>
        <br />
        <span class="f6">({ box.shopify_handle })</span>
      </td>
      <td class="pv3 pr3 bb b--black-20 rh-copy blue">${ parseFloat(box.shopify_price/100).toFixed(2) }</td>
    </tr>
  );
};

const Boxes = ({boxes}) => {
  //console.log(JSON.stringify(boxes[0], null, 2));
  return (
    <Fragment>
      <div class="overflow-auto">
        <table class="f6 w-100 mw8 center" cellspacing="0">
          <thead>
            <tr>
              <th class="fw6 bb b--black-20 tl pb3 pr3 bg-white">Delivery Date</th>
              <th class="fw6 bb b--black-20 tl pb3 pr3 bg-white">Title</th>
              <th class="fw6 bb b--black-20 tl pb3 pr3 bg-white">Price</th>
            </tr>
          </thead>
          <tbody class="lh-copy">
            { 
              boxes.map((box, index) => (
                <Box key={index} box={box} />
              ))
            }
          </tbody>
        </table>
      </div>
    </Fragment>
  )
};

function *CurrentBoxes() {
  let fetchJson = Array();
  let fetchError = null;

  this.addEventListener("click", async (ev) => {
    if (ev.target.tagName === "BUTTON") {
      if (fetchJson.length) {
        fetchJson = Array();
        this.refresh();
      } else {
        oboe('/api/current-boxes')
          .node('!.*', element => {
            fetchJson.push(element);
            this.refresh();
          })
          .fail(error => {
            console.log(error);
            /*
             * attributes of the error
             * thrown: The error, if one was thrown
             * statusCode: The status code, if the request got that far
             * body: The response body for the error, if any
             * jsonBody: If the server’s error response was JSON, the parsed body
             */
          });
      }
    }
  });

  while (true) {
    yield (
      <div class="f6 w-100 mw8 mt2 pb2 center bb" cellspacing="0">
        <button
          type="button"
          class="pointer br2 ba b--navy bg-dark-blue white pa2 ml1 mv1 bg-animate hover-bg-navy border-box">
          { fetchJson.length > 0 ? "Hide current boxes" : "Show current boxes" }
        </button>
        <div id="current-boxes" />
        { fetchError && <Error msg={fetchError} /> }
        { fetchJson.length > 0 && <Boxes boxes={fetchJson} /> }
      </div>
    );
  };
};

const FetchOrders = async () => {
  const { error, json } = await Fetch('/api/current-orders');
  console.log('error', error, 'json',  json);
};

const SyncBoxes = async () => {
  const { error, json } = await Fetch('/api/sync-boxes');
  console.log('error', error, 'json',  json);
};

module.exports = function () {
  return (
    <Fragment>
      <h1 class="lh-title">Current Orders</h1>
      <div class="f6 w-100 mw8 center bb" cellspacing="0">
        <button
          onclick={FetchOrders}
          type="button"
          class="pointer br2 ba b--navy bg-dark-blue white pa2 ml1 mv1 bg-animate hover-bg-navy border-box">
          View open orders</button>
        <p class="f5 lh-copy">
          This will collect and display all <strong>open</strong> and
          <strong>unfulfilled</strong> orders from
          <i>streamsideorganics.myshopify.com</i>. You will have the option to
          download these orders as a csv (xlxs) file.
        </p>
      </div>
      <h1 class="lh-title">Current Boxes</h1>
      <div class="f6 w-100 mw8 mt2 pb2 center bb" cellspacing="0">
        <button
          onclick={SyncBoxes}
          type="button"
          class="pointer br2 ba b--navy bg-dark-blue white pa2 ml1 mv1 bg-animate hover-bg-navy border-box">
        Sync boxes</button>
      </div>
      <CurrentBoxes />
    </Fragment>
  )
};
