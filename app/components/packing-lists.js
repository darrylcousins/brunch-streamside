/** @jsx createElement */
/**
 * Creates element to render a picking and packing lists for boxes, tabbed by delivery date
 *
 * @module app/components/packing-lists
 * @exports PackingLists
 * @author Darryl Cousins <darryljcousins@gmail.com>
 */
import { createElement, Fragment } from "@bikeshaving/crank/cjs";
import BarLoader from "../lib/bar-loader";
import Error from "../lib/error";
import { Fetch } from "../lib/fetch";
import SelectMenu from "../lib/select-menu";
import { DownloadIcon } from "../lib/icon";

/**
 * Creates element to render a picking and packing lists for boxes, tabbed by delivery date
 *
 * @generator
 * @yields {Element}
 */
function* PackingLists() {
  /**
   * JSON data fetched from api
   *
   * @member {object} fetchJson
   */
  let fetchJson = null;
  /**
   * Array of upcoming box dates from {@link module:api/current-box-dates}
   *
   * @member {Array}
   */
  let fetchDates = [];
  /**
   * Any error on fetching from api
   *
   * @member {object|string|null} fetchError
   */
  let fetchError = null;
  /**
   * The current selected date tab
   *
   * @member {string} selectedDate
   */
  let selectedDate = null;
  /**
   * Loading indicator whilst fetching from api
   *
   * @member {boolean} loading
   */
  let loading = true;

  /**
   * Filter product if bread
   *
   * @function isBread
   * @param {string} name Product name to be compared
   * @returns {boolean} Is bread product?
   */
  const isBread = (name) => Boolean(name.match(/bread|bellbird|sourdough/gi));
  /**
   * Filter product if fruit
   *
   * @function isFruit
   * @param {string} name Product name to be compared
   * @returns {boolean} Is fruit product?
   */
  const isFruit = (name) => Boolean(name.match(/apple|pear/gi));
  /**
   * Display date selection menu if active
   *
   * @member menuSelectDate
   * @type {boolean}
   */
  let menuSelectDate = false;

  /**
   * Load upcoming box dates which serve as headers and divide the tab
   * structure. The result populates {@link member:fetchDates} or on error,
   * {@link member:fetchError}
   *
   * @function loadDates
   */
  const loadDates = async () => {
    await Fetch(`/api/current-box-dates`)
      .then((result) => {
        const { error, json } = result;
        if (error !== null) {
          fetchError = error;
          loading = false;
          this.refresh();
        } else {
          fetchDates = json;
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
  loadDates();

  /**
   * When a date tab is selected the packing list for that delivery day are
   * fetched from {@link module:api/packing-list}
   *
   * @function loadSources
   * @param {string} date Passed to the api
   */
  const loadSources = (date) => {
    const src = `/api/packing-list/${new Date(Date.parse(date)).getTime()}`;
    loading = true;
    selectedDate = date;
    this.refresh();
    Fetch(src)
      .then((result) => {
        const { error, json } = result;
        if (error !== null) {
          fetchError = error;
          loading = false;
          this.refresh();
        } else {
          fetchJson = json;
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

  /**
   * Sort list of objects by `box` attribute.
   *
   * @function sortByBox
   * @param {Array} list Array to be sorted
   */
  const sortByBox = (list) => {
    list.sort((a, b) => (a.box > b.box ? 1 : -1));
    return list;
  };

  /**
   * Picking list and box extras are objects with the product name as keys.
   * This method returns a sorted list of those keys, putting fruit and bread
   * products to the fore and alphabetically sorting the vegetable products.
   *
   * @function sortByProducts
   * @param {Array} pickingList Array to be sorted
   * @returns {Array} The sorted list of product keys
   */
  const sortByProducts = (pickingList) => {
    const final = [];
    const pickingKeys = Object.keys(pickingList);
    const fruit = pickingKeys.filter((el) => isFruit(el)).sort();
    const bread = pickingKeys.filter((el) => isBread(el)).sort();
    const vege = pickingKeys
      .filter((item) => ![...fruit, ...bread].includes(item))
      .sort();
    fruit.forEach((key) => final.push(key));
    bread.forEach((key) => final.push(key));
    vege.forEach((key) => final.push(key));
    return final;
  };

  /**
   * Compares date to current selection
   *
   * @function isSelected
   * @param {string} date The date to compare to current selection
   */
  const isSelected = (date) => date === selectedDate;

  /**
   * Method to respond to a `click` event.
   *
   * @function selectTab
   * @param {object} ev The event, if on a tab then load packing lists
   */
  const selectTab = (ev) => {
    const name = ev.target.tagName;
    if (name === "H2") {
      const src = ev.target.innerHTML;
      loadSources(src);
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
          menuSelectDate = false;
          loadSources(date);
          this.refresh();
          break;
      }
    }
  };

  this.addEventListener("click", selectTab);

  /**
   * Crank component displaying a sorted list of included products of a box
   *
   * @function Includes
   * @param {object} props The property object
   * @param {Array} props.including The list of products
   * @returns {object} A DOM component
   */
  const Includes = ({ including }) => (
    <Fragment>
      <h4>Included box products</h4>
      {including.map((product) => (
        <span class="db">{product.shopify_title.replace(/^- ?/, "")}</span>
      ))}
    </Fragment>
  );

  /**
   * Crank component displaying a sorted list of extra products of a box
   *
   * @function Extras
   * @param {object} props The property object
   * @param {Array} props.extras The list of products
   * @returns {object} A DOM component
   */
  const Extras = ({ extras }) => {
    const keys = sortByProducts(extras);
    return (
      <Fragment>
        <h4>Extra box products</h4>
        {keys.map((key) => (
          <div class="dt dt--fixed">
            <div class="dtc">
              <span class="db">{key}</span>
            </div>
            <div class="dtc">
              <span class="db">{extras[key]}</span>
            </div>
          </div>
        ))}
      </Fragment>
    );
  };

  /**
   * Crank component displaying rows of product counts
   *
   * @function PickingCount
   * @returns {object} A DOM component
   */
  const PickingCount = () => {
    const keys = sortByProducts(fetchJson.picking);
    const { picking } = fetchJson;
    return (
      <Fragment>
        {keys.map((key) => (
          <tr crank-key={key} class="striped--near-white">
            <td class="pv1 ph1 bb b--black-20 v-top">{key}</td>
            <td class="pv1 ph1 bb b--black-20 v-top">
              {picking[key].standard}
            </td>
            <td class="pv1 ph1 bb b--black-20 v-top">
              {picking[key].extras}
            </td>
            <td class="pv1 ph1 bb b--black-20 v-top">
              {picking[key].total}
            </td>
          </tr>
        ))}
      </Fragment>
    );
  };

  while (true) {
    yield (
      <div class="f6 w-100 mt2 pb2 center">
        <h2 class="pt0 f5 f4-ns lh-title-ns">Picking and packing lists</h2>
        {fetchError && <Error msg={fetchError} />}
        {fetchDates && (
          <Fragment>
            <div class="w-100 dt fg-streamside-maroon bg-near-white">
              <div class="dtc tr v-mid">
                <SelectMenu
                  id="selectDate"
                  menu={fetchDates.map(el => ({text: el, item: el}))}
                  title="Select Delivery Date"
                  active={menuSelectDate}
                  style={{border: 0, color: "brown"}}
                >
                  { selectedDate ? `${selectedDate}` : "Select delivery date" }&nbsp;&nbsp;&nbsp;&#9662;
                </SelectMenu>
              </div>
            </div>
          </Fragment>
        )}
        {fetchJson && Object.keys(fetchJson.picking).length && (
          <Fragment>
            <h3 class="pt2">
              Picking list for {selectedDate} - {fetchJson.total_boxes} boxes
              <a
                class="no-underline dark-green dim dn"
                href={`/api/picking-list-download/${new Date(
                  selectedDate
                ).getTime()}`}
                title="Download as xlsx"
              >
                <DownloadIcon />
                <span class="dn">Download picking list</span>
              </a>
            </h3>
            <table class="f6 w-100 center" cellSpacing="0">
              <thead>
                <tr>
                  <th class="fw6 bb b--black-20 tl pb3 ph1 bg-white">
                    Product
                  </th>
                  <th class="fw6 bb b--black-20 tl pb3 ph1 bg-white">
                    Standard box count
                  </th>
                  <th class="fw6 bb b--black-20 tl pb3 ph1 bg-white">
                    Extras count
                  </th>
                  <th class="fw6 bb b--black-20 tl pb3 ph1 bg-white">Total</th>
                </tr>
              </thead>
              <tbody>
                <PickingCount />
              </tbody>
            </table>
          </Fragment>
        )}
        {fetchJson && (
          <h3 class="pt2">
            Packing list for {selectedDate} - {fetchJson.total_boxes} boxes
            <a
              class="no-underline dark-green dim dn"
              href={`/api/packing-list-download/${new Date(
                selectedDate
              ).getTime()}`}
              title="Download as xlsx"
            >
              <DownloadIcon />
              <span class="dn">Download packing list</span>
            </a>
          </h3>
        )}
        {fetchJson &&
          sortByBox(fetchJson.boxes).map((el) => (
            <Fragment>
              <h3 class="bt b--dark-gray pt2">
                {el.box} <small class="">Order count: {el.order_count}</small>
              </h3>

              <div class="dt-ns dt--fixed-ns">
                <div class="dtc-ns">
                  <Includes including={el.including} />
                </div>
                <div class="dtc-ns">
                  <Extras extras={el.extras} />
                </div>
              </div>
            </Fragment>
          ))}
        {loading && <BarLoader />}
      </div>
    );
  }
}

export default PackingLists;
