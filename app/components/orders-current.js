/** @jsx createElement */
/**
 * Creates element to render html display of order listing, tabbed by delivery date.
 *
 * @module app/components/order-current
 * @exports CurrentOrders
 * @author Darryl Cousins <darryljcousins@gmail.com>
 */
import { createElement, Fragment } from "@bikeshaving/crank/cjs";

import AddOrderModal from "./order-add";
import RemoveOrders from "./orders-remove";
import HelpSection from "./order-help";
import { TableHeader, TableBody } from "./order-table";
import BarLoader from "../lib/bar-loader";
import Error from "../lib/error";
import SelectMenu from "../lib/select-menu";
import { Fetch } from "../lib/fetch";
import { DownloadIcon } from "../lib/icon";
import { SaveAltIcon } from "../lib/icon";

/**
 * Create a DOM representation of orders grouped using tabs by delivery date.
 * Orders are fetched from the api using {@link
 * module:app/lib/fetch~Fetch|Fetch}
 *
 * @generator
 * @yields {Element} DOM element displaying orders
 */
function* CurrentOrders() {
  /**
   * Orders fetched from api as a dictionary keyed by the delivery date
   *
   * @member {object} fetchOrders
   */
  let fetchOrders = {};
  /**
   * Delivery dates - the array of keys from fetchOrders
   *
   * @member {object} fetchDates
   */
  let fetchDates = []
  /**
   * If fetch returns an error
   *
   * @member {object|string} fetchError
   */
  let fetchError = null;
  /**
   * Headers fetched from api
   *
   * @member {Array} fetchHeaders
   */
  let fetchHeaders = [];
  /**
   * True while loading data from api
   *
   * @member {boolean} loading
   */
  let loading = true;
  /**
   * Select date for order display table
   *
   * @member {boolean} selectedDate
   */
  let selectedDate = null;
  /**
   * Display date selection menu if active
   *
   * @member menuSelectDate
   * @type {boolean}
   */
  let menuSelectDate = false;

  /**
   * Fetch orders data on mounting of component
   *
   * @function getOrders
   */
  const getOrders = () => {
    Fetch(`/api/current-orders`)
      .then((result) => {
        const { error, json } = result;
        if (error !== null) {
          fetchError = error;
          console.log("fetch error:", fetchError);
          loading = false;
          this.refresh();
        } else {
          const { headers, orders } = json;
          fetchHeaders = headers;
          fetchOrders = orders;
          fetchDates = Object.keys(orders);
          if (fetchDates.length) selectedDate = fetchDates[0];
          loading = false;
          this.refresh();
        }
      })
      .catch((err) => {
        fetchError = err;
        loading = false;
        this.refresh();
      });
  };

  getOrders();

  /**
   * Toggle the buttons displayed with tab heading, add order, remove orders and download csv file.
   *
   * @function
   * @param {string} id The tabbed header id to match with button or a tag
   * @param {Element} el The button or link tag to toggle visibility along with tab heading
   */
  const toggleButtons = (id, el) => {
    const name = el.getAttribute("name");
    if (name === id) {
      el.classList.remove("dn");
      el.classList.add("dib");
    } else if (name !== id) {
      el.classList.remove("dib");
      el.classList.add("dn");
    }
  };

  /**
   * Switch tabs
   *
   * @function switchTab
   * @param {object} ev Click event
   * @listens window.click
   */
  const switchTab = async (ev) => {
    const name = ev.target.tagName;
    if (name === "LABEL" || name === "H2") {
      const { id } = ev.target;
      if (id) {
        const color = "dark-green";
        const bgcolor = "bg-near-white";
        const opacity = "o-40";
        document.querySelectorAll("label[name='tabs']>div").forEach((el) => {
          toggleButtons(id, el);
        });
        document.querySelectorAll("label[name='tabs']").forEach((el) => {
          if (el.id !== id) {
            el.classList.remove(color);
            el.classList.remove(bgcolor);
            el.classList.add(opacity);
          }
        });
        const label = document.querySelector(`label#${id}`);
        label.classList.add(color);
        label.classList.add(bgcolor);
        label.classList.remove(opacity);
      }
    } else if (name === "BUTTON") {

      switch(ev.target.id) {
        case "selectDate":
          menuSelectDate = !menuSelectDate;
          this.refresh()
          break;
      }
    } else if (name === "DIV") {

      switch(ev.target.getAttribute("name")) {
        case "selectDate":
          const date = ev.target.getAttribute("data-item");
          console.log(date, ":", fetchOrders[date]);
          selectedDate = date;
          menuSelectDate = false;
          this.refresh();
          break;
      }
    }
  };

  this.addEventListener("click", switchTab);

  /**
   * Return count for orders on delivery date for use in loop
   *
   * @function getOrderCount
   * @param {string} key Delivery date as key
   * @returns {number} Array length
   */
  const getOrderCount = (key) => fetchOrders[key].length;

  /**
   * Return orders by delivery date
   *
   * @function getOrdersByKey
   * @param {string} key Delivery date as key
   * @returns {Array} Array of orders for date
   */
  const getOrdersByKey = (key) => fetchOrders[key];

  /**
   * Return count of headers
   *
   * @function getHeaderCount
   * @returns {number} Length of headers array
   */
  const getHeaderCount = () => fetchHeaders.length;

  /**
   * Returns array of headers
   *
   * @function getHeaders
   * @returns {number} Array length
   */
  const getHeaders = () => fetchHeaders;

  while (true) {
    yield (
      <div class="f6 w-100 pb2 center">
        <div class="dt dt--fixed">
          <div class="dtc">
            <h2 class="pt0 f5 f4-ns lh-title-ns ma0 fg-streamside-maroon">
              Current Orders
            </h2>
            <p class="lh-copy">
              {loading ? (
                <span>
                  <i class="b">Hold tight.</i> Collecting and collating{" "}
                </span>
              ) : (
                "Displaying "
              )}
              all <code class="b">unfulfilled</code> orders from
              <i class="b"> streamsideorganics.myshopify.com</i>.
              {loading && "This will take a moment."}
            </p>
            { fetchOrders.hasOwnProperty("No delivery date") && fetchOrders["No delivery date"].length > 0 && (
              <p class="w-95 ba br2 pa3 ma2 red bg-washed-red" role="alert">
                <strong>Note!</strong> We have an order recorded with no delivery date, this will need attention.
              </p>
            )}
          </div>
          {!loading && false && (
            <div class="dtc relative">
              <HelpSection>
              </HelpSection>
            </div>
          )}
        </div>
        <div class="overflow-auto">
          {fetchError && <Error msg={fetchError} />}
          <div class="w-100 dt fg-streamside-maroon bg-near-white">
            <div class="dtc tr v-mid">
              <SelectMenu
                id="selectDate"
                menu={fetchDates.map(el => ({text: `${el} (${getOrderCount(el)})`, item: el}))}
                title="Select Delivery Date"
                active={menuSelectDate}
                style={{border: 0, color: "brown"}}
              >
                { selectedDate ? `${selectedDate} (${getOrderCount(selectedDate)})` : "Select delivery date" }&nbsp;&nbsp;&nbsp;&#9662;
              </SelectMenu>
            </div>
            {selectedDate && (
              <Fragment>
                {new Date(selectedDate).toString() !== "Invalid Date" && (
                  <div class="dtc tr v-bottom">
                    <button
                      class={`dib w-third f6 outline-0 dark-blue b--dark-green ba ba1 bg-transparent br2 br--left mv1 pointer`}
                      title="Download picking list"
                      type="button"
                      onclick={() => window.location=`/api/picking-list-download/${new Date(
                        selectedDate
                      ).getTime()}`}
                      >
                        <span class="v-mid">Picking List</span>
                        <span class="v-mid">
                          <SaveAltIcon />
                        </span>
                    </button>
                    <button
                      class={`dib w-third f6 outline-0 blue b--dark-green bt bb br bl-0 bg-transparent mv1 pointer`}
                      title="Download packing list"
                      type="button"
                      onclick={() => window.location=`/api/packing-list-download/${new Date(
                        selectedDate
                      ).getTime()}`}
                      >
                        <span class="v-mid">Packing List</span>
                        <span class="v-mid">
                          <SaveAltIcon />
                        </span>
                    </button>
                    <button
                      class={`dib w-third f6 outline-0 green b--dark-green bt bb br bl-0 br2 br--right bg-transparent mv1 pointer`}
                      title="Download orders"
                      type="button"
                      onclick={() => window.location=`/api/orders-download/${new Date(
                        selectedDate
                      ).getTime()}`}
                      >
                        <span class="v-mid">Orders</span>
                        <span class="v-mid">
                          <SaveAltIcon />
                        </span>
                    </button>
                  </div>
                )}
                <div class="dtc tr v-mid">
                  <AddOrderModal delivered={selectedDate} />
                  <RemoveOrders delivered={selectedDate} />
                </div>
              </Fragment>
            )}
          </div>
          {selectedDate && (
            <table class="f6 w-100 center" cellSpacing="0">
              {getHeaderCount() && (
                <TableHeader
                  crank-key={`${selectedDate}-th`}
                  headers={getHeaders()}
                />
              )}
              {getOrderCount(selectedDate) && (
                <TableBody
                  crank-key={`${selectedDate}-tb`}
                  orders={getOrdersByKey(selectedDate)}
                />
              )}
            </table>
          )}
        </div>
        {loading && <BarLoader />}
      </div>
    );
  }
}

export default CurrentOrders;
