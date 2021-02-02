/** @jsx createElement */
/**
 * Creates element to render html display of order listing, tabbed by delivery date.
 *
 * @module app/components/order-current
 * @exports CurrentOrders
 */
import { createElement } from "@bikeshaving/crank/cjs";

import AddOrderModal from "./order-add";
import RemoveOrders from "./orders-remove";
import HelpSection from "./order-help";
import { TableHeader, TableBody } from "./order-table";
import BarLoader from "../lib/bar-loader";
import Error from "../lib/error";
import { Fetch } from "../lib/fetch";
import { DownloadIcon } from "../lib/icon";

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
   * Orders fetched from api
   *
   * @member {object} fetchOrders
   */
  let fetchOrders = {};
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
          </div>
          {!loading && (
            <div class="dtc relative">
              <HelpSection>
                <p class="lh-copy o-70">
                  &#x26AA; Click on the date header to display orders for that
                  delivery date.
                  <br />
                  &#x26AA; The <code>download</code> symbol is a link to
                  download the individual
                  <code> xlsx</code> files for each delivery date.
                  <br />
                  <span class="pl3">
                    (Orders which haven&apos;t recorded a delivery date will also be
                    included.)
                  </span>
                  <br />
                  &#x26AA; Packing lists for are also available for download
                  from the link in the header menu.
                </p>
              </HelpSection>
            </div>
          )}
        </div>
        <div class="overflow-auto">
          {fetchError && <Error msg={fetchError} />}
          {Object.keys(fetchOrders).length > 0 && (
            <div class="tabs center bt">
              <div class="tabs__menu dt dt--fixed mb2 bb b--black-40">
                {Object.keys(fetchOrders).map((key, index) => (
                  <label
                    name="tabs"
                    for={key.replace(/ /g, "-")}
                    htmlFor={key.replace(/ /g, "-")}
                    id={`${key.replace(/ /g, "-")}-key`}
                    class={`tabs__menu-item dtc tc pt1 pb2 pointer dib fg-streamside-maroon ${
                      index !== 0
                        ? "o-40 hover-bg-light-gray"
                        : "fg-streamside-blue bg-near-white"
                    }`}
                  >
                    <h2
                      class="mv0 pa1 fw5 f6 f5-ns ttu tracked"
                      id={`${key.replace(/ /g, "-")}-key`}
                      data-index={index}
                      name="tabs"
                    >
                      {key}&nbsp; ({getOrderCount(key)})
                    </h2>
                    <div
                      class={index !== 0 ? "dn" : "dib"}
                      name={`${key.replace(/ /g, "-")}-key`}
                    >
                      <AddOrderModal delivered={key} />
                      <RemoveOrders delivered={key} />
                      {new Date(key).toString() !== "Invalid Date" && (
                        <a
                          name={`${key.replace(/ /g, "-")}-key`}
                          class="no-underline green dib"
                          href={`/api/orders-download/${new Date(
                            key
                          ).getTime()}`}
                          title="Download as xlsx"
                        >
                          <DownloadIcon />
                          <span class="dn">Download</span>
                        </a>
                      )}
                    </div>
                  </label>
                ))}
              </div>
              <div class="tabs__content">
                {Object.keys(fetchOrders).map((key, index) => (
                  <div>
                    <input
                      type="radio"
                      class="dn"
                      name="sections"
                      id={key.replace(/ /g, "-")}
                      checked={index === 0}
                    />
                    <div class="tabs__content__info">
                      <table class="f6 w-100 center" cellSpacing="0">
                        {getHeaderCount() && (
                          <TableHeader
                            crank-key={`${key}-th`}
                            headers={getHeaders()}
                          />
                        )}
                        {getOrderCount(key) && (
                          <TableBody
                            crank-key={`${key}-tb`}
                            orders={getOrdersByKey(key)}
                          />
                        )}
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        {loading && <BarLoader />}
      </div>
    );
  }
}

export default CurrentOrders;
