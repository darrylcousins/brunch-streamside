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
import BoxRulesModal from "./box-rules";
import DuplicateBoxModal from "./boxes-duplicate";
import RemoveBoxesModal from "./boxes-remove";
import BarLoader from "../lib/bar-loader";
import Error from "../lib/error";
import { PostFetch, Fetch } from "../lib/fetch";
import IconButton from "../lib/icon-button";
import SelectMenu from "../lib/select-menu";
import Boxes from "./boxes";
import PushMenu from "../lib/push-menu";
import { animateFadeForAction } from "../helpers";
import {
  MenuIcon,
  SaveAltIcon,
  EditIcon,
  DeleteIcon,
  ToggleOnIcon,
  ToggleOffIcon,
} from "../lib/icon";

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
   * @listens listing.reload
   */
  const reloadBoxes = (ev) => {
    console.log('still have the date', selectedDate);
    getDates();
  };

  this.addEventListener("listing.reload", reloadBoxes);

  /*
   * Submit form to toggle boxes on/off active
   * @function toggleBox
   */
  const toggleBoxes = async (data) => {
    const headers = { "Content-Type": "application/json" };
    const { error, json } = await PostFetch({
      src: "/api/toggle-box-active",
      data,
      headers,
    })
      .then((result) => result)
      .catch((e) => ({
        error: e,
        json: null,
      }));
    if (!error) {
      reloadBoxes();
    }
    // need to provide user feedback of success or failure
    return { error, json };
  };

  /**
   * Switch tabs
   *
   * @function switchTab
   * @param {object} ev Click event
   * @listens window.click
   */
  const clickEvent = async (ev) => {
    let target = ev.target;
    if (["PATH", "SVG"].includes(target.tagName.toUpperCase())) {
      target = target.closest("button");
    };
    const name = target.tagName.toUpperCase();
    if (name === "BUTTON") {

      switch(target.id) {
        case "selectDate":
          // open and close date select dropdown
          menuSelectDate = !menuSelectDate;
          this.refresh();
          break;
      };
      let data;
      switch(target.getAttribute("name")) {
        case "toggle-on":
          console.log('Toggle ON');
          data = {
            delivered: selectedDate,
            active: true,
          };
          await toggleBoxes(data);
          break;
        case "toggle-off":
          console.log('Toggle OFF');
          data = {
            delivered: selectedDate,
            active: false,
          };
          await toggleBoxes(data);
          break;
      };
    } else if (name === "DIV") {

      switch(target.getAttribute("name")) {
        case "selectDate":
          // set selected date from date select dropdown component
          const date = target.getAttribute("data-item");
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
        // close menu on all clicks not captured
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
  const sideMenu = [<BoxCoreModal />, <BoxRulesModal />];

  for (const _ of this) { // eslint-disable-line no-unused-vars

    const active = fetchBoxes.find(el => el.active === true);
    const inactive = fetchBoxes.find(el => el.active === false);

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
            {selectedDate ? (
              <Fragment>
                <div class="w-100 w-two-thirds-l fl-l tr v-mid">
                  {active && (
                    <IconButton color="dark-green" title="Toggle all boxes off" name="toggle-off">
                      <ToggleOnIcon />
                    </IconButton>
                  )}
                  {inactive && (
                    <IconButton color="dark-red" title="Toggle all boxes on" name="toggle-on">
                      <ToggleOffIcon />
                    </IconButton>
                  )}
                  <DuplicateBoxModal currentDate={selectedDate} />
                  <AddBoxModal delivered={selectedDate} />
                  <RemoveBoxesModal delivered={selectedDate} />
                </div>
              </Fragment>
            ) : (
              <div class="w-100 w-two-thirds-l fl-l tr v-mid">
                <AddBoxModal delivered={null} />
              </div>
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
