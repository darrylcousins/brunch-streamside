/** @jsx createElement */
/**
 * Top of hierarchy of elements to render boxes
 *
 * @module app/components/boxes-current
 * @exports CurrentBoxes
 * @requires module:app/components/boxes~Boxes
 * @author Darryl Cousins <darryljcousins@gmail.com>
 */
import { createElement, Fragment } from "@bikeshaving/crank/cjs";
import AddBoxModal from "./box-add";
import BoxCoreModal from "./box-core";
import DuplicateBoxModal from "./boxes-duplicate";
import RemoveBoxesModal from "./boxes-remove";
import BarLoader from "../lib/bar-loader";
import Error from "../lib/error";
import { Fetch } from "../lib/fetch";
import { MenuIcon, SaveAltIcon, EditIcon, DeleteIcon } from "../lib/icon";
import SelectMenu from "../lib/select-menu";
import Boxes from "./boxes";
import PushMenu from "../lib/push-menu";
import { animateFadeForAction } from "../helpers";

/**
 * Uses fetch to collect current boxes from api and then passes data to
 * {@link module:app/boxes} to display as a table.
 *
 * @generator
 * @yields {Element}
 */
function* CurrentBoxes() {

  /**
   * Contains box data as collected from [api/current-boxes]{@link
   * module:api/current-boxes}. The data uses delivery date as keys to unsorted
   * array of box data.
   *
   * @returns {Element} Dom component
   * @member fetchJson
   * @type {object.<string, Array>}
   */
  let fetchJson = {};
  /**
   * Display loading indicator while fetching data
   *
   * @member loading
   * @type {boolean}
   */
  let loading = true;
  /**
   * Boxes fetched from api for the selectedDate
   *
   * @member {object} fetchBoxes
   */
  let fetchBoxes = [];
  /**
   * Delivery dates - the array of dates from fetchDates
   *
   * @member {object} fetchDates
   */
  let fetchDates = [];
  /**
   * If fetching data was unsuccessful.
   *
   * @member fetchError
   * @type {object|string|null}
   */
  let fetchError = null;
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
   * Fetch boxes data on mounting of component use the closest next date or on
   * change of selectedDate
   *
   * @function getBoxes
   */
  const getBoxes = () => {
    let uri = `/api/current-boxes-by-date/${new Date(selectedDate).getTime()}`;
    Fetch(uri)
      .then((result) => {
        const { error, json } = result;
        if (error !== null) {
          fetchError = error;
          loading = false;
          this.refresh();
        } else {
          loading = false;
          fetchBoxes = json;
          if (document.getElementById("boxes-table")) {
            animateFadeForAction("boxes-table", async () => await this.refresh());
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
   * Fetch available dates
   *
   * @function getDates
   */
  const getDates = () => {
    const uri = `/api/current-box-dates`;
    Fetch(uri)
      .then((result) => {
        const { error, json } = result;
        if (error !== null) {
          fetchError = error;
          console.log("fetch error:", fetchError);
          loading = false;
          this.refresh();
        } else {
          fetchDates = json;
          if (!selectedDate) {
            if (fetchDates.length) selectedDate = fetchDates[0];
          } else {
            if (!fetchDates.includes(selectedDate)) selectedDate = fetchDates[0];
          };
          getBoxes();
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
   * @listens boxes.reload
   */
  const reloadBoxes = (ev) => {
    getDates();
  };

  this.addEventListener("boxes.reload", reloadBoxes);

  /**
   * Switch tabs
   *
   * @function switchTab
   * @param {object} ev Click event
   * @listens window.click
   */
  const clickEvent = async (ev) => {
    const name = ev.target.tagName;
    if (name === "BUTTON") {

      switch(ev.target.id) {
        case "selectDate":
          // open and close date select dropdown
          menuSelectDate = !menuSelectDate;
          this.refresh();
          break;
      }
    } else if (name === "DIV") {

      switch(ev.target.getAttribute("name")) {
        case "selectDate":
          // set selected date from date select dropdown component
          const date = ev.target.getAttribute("data-item");
          menuSelectDate = false;
          if (date !== selectedDate) {
            selectedDate = date;
          } else {
            this.refresh();
          };
          getBoxes();
          break;
      }
    } else {
      if (menuSelectDate) {
        menuSelectDate = !menuSelectDate;
        this.refresh();
      }
    }
  };

  this.addEventListener("click", clickEvent);

  /**
   * Hide the select dropdown on escape key
   *
   * @function hideModal
   * @param {object} ev Event emitted
   * @listens window.keyup
   */
  const keyEvent = async (ev) => {
    if (ev.key && ev.key === "Escape") {
      if (menuSelectDate) {
        menuSelectDate = !menuSelectDate;
        this.refresh();
      }
    }
  };

  this.addEventListener("keyup", keyEvent);

  // collects dates and boxes and set side navigation menu
  getDates();

  /**
   * Side navigation menu
   *
   * @member sideMenu
   * @type {array}
   */
  const sideMenu = [<BoxCoreModal />];

  for (const _ of this) { // eslint-disable-line no-unused-vars
    yield (
      <div class="f6 w-100 pb2 center">
        {loading && <BarLoader />}
        <h2 class="pt0 f5 f4-ns lh-title-ns ma0 fg-streamside-maroon" id="boxes-title">
          <PushMenu children={sideMenu} />
          Current Boxes {selectedDate ? `for ${selectedDate}` : ""}
        </h2>
        <div class="overflow-visible">
          {fetchError && <Error msg={fetchError} />}
          <div class="w-100 fg-streamside-maroon">
            <div class="tr v-mid w-100 w-third-l fl-l">
              <SelectMenu
                id="selectDate"
                menu={fetchDates.map(el => ({text: el, item: el}))}
                title="Select Delivery Date"
                active={menuSelectDate}
                style={{border: 0, color: "brown"}}
              >
                { selectedDate ? selectedDate : "Select delivery date" }&nbsp;&nbsp;&nbsp;&#9662;
              </SelectMenu>
            </div>
            {selectedDate && (
              <Fragment>
                <div class="w-100 w-two-thirds-l fl-l tr v-mid">
                  <DuplicateBoxModal currentDate={selectedDate} />
                  <AddBoxModal delivered={selectedDate} />
                  <RemoveBoxesModal delivered={selectedDate} />
                </div>
              </Fragment>
            )}
          </div>
          {fetchBoxes.length > 0 && (
            <Boxes boxes={fetchBoxes} />
          )}
        </div>
      </div>
    );
  }
}

export default CurrentBoxes;
