/** @jsx createElement */
/**
 * Starting point of url route /settings
 *
 * @module app/route/settings-plus
 * @exports SettingsPlus
 * @requires module:app/settings
 * @author Darryl Cousins <darryljcousins@gmail.com>
 */
import { createElement, Fragment } from "@bikeshaving/crank/cjs";
import AddSetting from "./setting-add";
import EditSettingModal from "./setting-edit";
import RemoveSettingModal from "./setting-remove";
import { animateFadeForAction } from "../helpers";
import BarLoader from "../lib/bar-loader";
import Error from "../lib/error";
import { Fetch } from "../lib/fetch";

/**
 * SettingsPlus
 *
 * @function
 * @returns {Element} DOM component
 * @example
 * import {renderer} from '@bikeshaving/crank/cjs/dom';
 * renderer.render(<SettingsPlus />, document.querySelector('#app'))
 */
function *SettingsPlus() {

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
   * SettingsPlus fetched from api as array grouped by tag
   *
   * @member {object} fetchSettings
   */
  let fetchSettings = [];

  /**
   * Fetch settings data on mounting of component
   *
   * @function getSettings
   */
  const getSettings = () => {
    let uri = "/api/current-settings";
    Fetch(uri)
      .then((result) => {
        const { error, json } = result;
        if (error !== null) {
          fetchError = error;
          loading = false;
          this.refresh();
        } else {
          loading = false;
          fetchSettings = json;
          if (document.getElementById("settings-table")) {
            animateFadeForAction("settings-table", async () => await this.refresh());
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
   * @listens boxes.reload
   */
  const reloadSettings = (ev) => {
    getSettings();
  };

  this.addEventListener("listing.reload", reloadSettings);

  getSettings();

  for (const _ of this) {
    yield (
      <div class="f6 w-100 pb2 center">
        {loading && <BarLoader />}
        <h2 class="pt0 f5 f4-ns lh-title-ns ma0 fg-streamside-maroon">
          Settings
        </h2>
        <AddSetting />
        <div class="overflow-visible" id="settings-table">
          {fetchError && <Error msg={fetchError} />}
          {fetchSettings.length > 0 && (
            fetchSettings.map(
              (group, idx) => (
                <Fragment>
                  <h3 class="pt0 lh-title-ns ma0 fg-streamside-maroon">
                    {group._id}
                  </h3>
                  <table class="f6 mt2 w-100 center table-striped" cellSpacing="0">
                    <tbody>
                      {group.settings.map(el => (
                        <tr>
                          <td data-title="Handle" class="w-20-l pv3 pr3 bb b--black-20 v-top">
                            {el.handle}
                          </td>
                          <td data-title="Title" class="w-20-l pv3 pr3 bb b--black-20 v-top">
                            {el.title}
                          </td>
                          <td data-title="Value" class="w-20-l pv3 pr3 bb b--black-20 v-top">
                            {el.value}
                          </td>
                          <td data-title="Description" class="w-30-l pv3 pr3 bb b--black-20 v-top">
                            {el.note}
                          </td>
                          <td data-title="Actions" class="w-10-l pv3 pr3 bb b--black-20 v-top">
                            <EditSettingModal setting={el} />
                            <RemoveSettingModal setting={el} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Fragment>
              )
            )
          )}
        </div>
      </div>
    );
  };
}

export default SettingsPlus;

