/** @jsx createElement */
/**
 * Starting point of url route /subscribers
 * Provides interface for general user to edit subscribers
 * i.e. cannot add subscribers, only editable subscribers are included
 *
 * @module app/route/subscribers
 * @exports Subscribers
 * @requires module:app/subscribers
 * @author Darryl Cousins <darryljcousins@gmail.com>
 */
import { createElement, Fragment } from "@bikeshaving/crank/cjs";
import { animateFadeForAction, hasOwnProp } from "../helpers";
import CollapseWrapper from "./collapse-animator";
import BarLoader from "../lib/bar-loader";
import Error from "../lib/error";
import Button from "../lib/button";
import { Fetch, PostFetch } from "../lib/fetch";
import {
  CaretUpIcon,
  CaretDownIcon,
} from "../lib/icon";
import AddSubscriberModal from "./subscriber-add";
import EditSubscriberModal from "./subscriber-edit";
import RemoveSubscriberModal from "./subscriber-remove";

/**
 * Subscribers
 *
 * @function
 * @returns {Element} DOM component
 * @example
 * import {renderer} from '@bikeshaving/crank/cjs/dom';
 * renderer.render(<Subscribers />, document.querySelector('#app'))
 */
function *Subscribers() {

  /**
   * Display loading indicator while fetching data
   *
   * @member loading
   * @type {boolean}
   */
  let loading = true;
  /**
   * If fetching data was unsuccessful.
   *
   * @member fetchError
   * @type {object|string|null}
   */
  let fetchError = null;
  /**
   * Subscribers fetched from api
   *
   * @member {object} fetchSubscribers
   */
  let fetchSubscribers = {};

  /**
   * Fetch subscribers data on mounting of component
   *
   * @function getSubscribers
   */
  const getSubscribers = () => {
    let uri = "/api/current-subscribers";
    Fetch(uri)
      .then((result) => {
        const { error, json } = result;
        if (error !== null) {
          fetchError = error;
          loading = false;
          this.refresh();
        } else {
          loading = false;
          fetchSubscribers = json;
          if (document.getElementById("subscribers-table")) {
            animateFadeForAction("subscribers-table", async () => await this.refresh());
          } else {
            this.refresh();
          };
        }
      })
      .catch((err) => {
        fetchError = err;
        loading = false;
        this.refresh();
      });
  };

  /**
   * Event handler when {@link
   * module:form/form-modal~FormModalWrapper|FormModalWrapper} saves the data
   *
   * @function reloadBoxes
   * @param {object} ev The event
   * @listens listing.reload
   */
  const reloadSubscribers = (ev) => {
    getSubscribers();
  };

  this.addEventListener("listing.reload", reloadSubscribers);

  getSubscribers();

  for (const _ of this) {
    yield (
      <div class="f6 pb2">
        {loading && <BarLoader />}
        <div class="mt3" id="subscribers-table">
          {fetchError && <Error msg={fetchError} />}
          <div class="tr">
            <AddSubscriberModal />
          </div>
          {Object.keys(fetchSubscribers).length > 0 && (
            <table class="f6 mt2 w-100 center table-striped" cellSpacing="0">
              <thead>
                <tr>
                  {["ShopifyID", "Name", "Box", "Delivery Dates", "Likes", "Dislikes", ""].map(el => (
                    <th class="fw6 bb b--black-20 tl pv3 pr3 bg-white sticky">
                      {el}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {fetchSubscribers.map(el => (
                  <tr>
                    <td data-title="ID" class="w-10-l pv3 pr3 bb b--black-20 v-top">
                      {el.shopify_customer_id} <span class="dn">{el._id}</span>
                    </td>
                    <td data-title="Name" class="w-10-l pv3 pr3 bb b--black-20 v-top">
                      {el.name}
                    </td>
                    <td data-title="Name" class="w-20-l pv3 pr3 bb b--black-20 v-top">
                      {el.box}
                    </td>
                    <td data-title="Delivery Dates" class="w-20-l pv3 pr3 bb b--black-20 v-top">
                      {el.delivery_dates.map(el => (
                        <span class="db">{el}</span>
                      ))}
                    </td>
                    <td data-title="Likes" class="w-20-l pv3 pr3 bb b--black-20 v-top">
                      {el.likes}
                    </td>
                    <td data-title="Dislikes" class="w-20-l pv3 pr3 bb b--black-20 v-top">
                      {el.dislikes}
                    </td>
                    <td data-title="Actions" class="w-10-l pv3 pr3 bb b--black-20 v-top">
                      <EditSubscriberModal subscriber={el} />
                      <RemoveSubscriberModal subscriber={el} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    );
  };
}

export default Subscribers;
