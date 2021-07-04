/** @jsx createElement */
/**
 * Starting point of url route /settings
 * Provides interface for general user to edit settings
 * i.e. cannot add settings, only editable settings are included
 *
 * @module app/route/settings
 * @exports Settings
 * @requires module:app/settings
 * @author Darryl Cousins <darryljcousins@gmail.com>
 */
import { createElement, Fragment } from "@bikeshaving/crank/cjs";
import { animateFadeForAction, hasOwnProp } from "../helpers";
import CollapseWrapper from "./collapse-animator";
import BarLoader from "../lib/bar-loader";
import Error from "../lib/error";
import Button from "../lib/button";
import { Fetch, PostFetch } from "../lib/fetch";
import AppView from "./settings-app-view";
import {
  CaretUpIcon,
  CaretDownIcon,
} from "../lib/icon";

/**
 * Settings
 *
 * @function
 * @returns {Element} DOM component
 * @example
 * import {renderer} from '@bikeshaving/crank/cjs/dom';
 * renderer.render(<Settings />, document.querySelector('#app'))
 */
function *Settings() {

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
   * Are we editing?
   *
   * @member loading
   * @type {boolean}
   */
  let editing = false;
  /**
   * Settings fetched from api as object keyed by handle (see saveSettings)
   *
   * @member {object} fetchSettings
   */
  let allSettings = {};
  /**
   * Settings fetched from api and passed to AppView
   *
   * @member {object} fetchSettings
   */
  let appSettings = {};
  /**
   * Settings fetched from api as array grouped by tag trimmed for accessibility
   *
   * @member {object} fetchSettings
   */
  let fetchSettings = {};
  /**
   * Settings sent up from SettingsAppView on hover
   *
   * @member {object} selectedSettings
   */
  let selectedSettings = {};
  /**
   * General settings are collapsible
   *
   * @member {object} collapsedSettings
   */
  let collapsedSettings = true;

  /**
   * Keep clickable settings in view
   *
   * @function onScroll
   */
  const onScroll = () => {
    const fixSettings = document.getElementById("other-settings");
    let y;
    if (fixSettings) {
      const y = fixSettings.offsetTop - 50;
      if (window.scrollY > y) {
        fixSettings.classList.add("sticky-settings");
      } else {
        fixSettings.classList.remove("sticky-settings");
      };
    };
  };

  window.addEventListener("scroll", onScroll);

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
          json.forEach(el => {
            fetchSettings[el._id] = {}; // for this component
            appSettings[el._id] = {}; // for the AppView component
            el.settings.forEach(setting => {
              allSettings[setting.handle] = setting;
              fetchSettings[el._id][setting.handle] = [setting.note, setting.value];
              appSettings[el._id][setting.handle] = setting.value;
            });
          });
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

  /** Provide access to the app settings
   *
   * @method {object} getSetting
   * @returns {boolead} Returns true if the property exists on the object
   */
  const getSetting = (type, key) => {
    if (hasOwnProp.call(fetchSettings, type)) {
      const settings = fetchSettings[type];
      if (hasOwnProp.call(settings, key)) {
        return settings[key];
      };
    };
    return "";
  };

  /**
   * Event handler when {@link
   * module:form/form-modal~FormModalWrapper|FormModalWrapper} saves the data
   *
   * @function reloadBoxes
   * @param {object} ev The event
   * @listens listing.reload
   */
  const reloadSettings = (ev) => {
    getSettings();
  };

  this.addEventListener("listing.reload", reloadSettings);

  /**
   * Event handler when {@link
   * module:components/settings-app-view~SettingsAppView} hovers over editable settings
   *
   * @function hoverSettings
   * @param {object} ev The event
   * @listens appview.hover
   */
  const mouseoverSettings = (ev) => {
    if (editing) return;
    const {types, keys} = ev.detail;
    let i;
    for (i=0; i<types.length; i++) {
      if (!hasOwnProp.call(selectedSettings, types[i])) {
        selectedSettings[types[i]] = [];
      };
      selectedSettings[types[i]].push(keys[i]);
    };
    this.refresh();
  };

  this.addEventListener("appview.mouseover", mouseoverSettings);

  /**
   * Event handler when {@link
   * module:components/settings-app-view~SettingsAppView} moves off editable settings
   *
   * @function mouseoutSettings
   * @param {object} ev The event
   * @listens appview.hover
   */
  const mouseoutSettings = (ev) => {
    if (editing) return;
    selectedSettings = {};
    this.refresh();
  };

  this.addEventListener("appview.mouseout", mouseoutSettings);

  /**
   * Event handler when {@link
   * module:components/settings-app-view~SettingsAppView} is clicked
   *
   * @function mouseclickSettings
   * @param {object} ev The event
   * @listens appview.click
   */
  const mouseclickSettings = (ev) => {
    editing = true;
    this.refresh();
  };

  this.addEventListener("appview.mouseclick", mouseclickSettings);

  /**
   * Event handler when editing is cancelled by user
   *
   * @function cancelEdit
   * @param {object} ev The event
   */
  const cancelEdit = (ev) => {
    editing = false;
    selectedSettings = {};
    this.refresh();
  };

  /**
   * Event handler when edit is saved by user
   *
   * @function saveEdit
   * @param {object} ev The event
   */
  const saveEdit = async (ev) => {
    const inputs = document.querySelectorAll("input[name='setting']");
    const data = [];
    inputs.forEach(el => {
      const setting = {...allSettings[el.id]};
      setting.value = el.value;
      data.push(setting);
    });
    console.log(JSON.stringify(data, null, 2));
    const headers = { "Content-Type": "application/json" };
    const { error, json } = await PostFetch({
      src: "/api/edit-settings",
      data,
      headers,
    })
      .then((result) => result)
      .catch((e) => ({
        error: e,
        json: null,
      }));
    if (!error) {
      getSettings();
    };
  };

  getSettings();

  /**
   * Products component - will be wrapped in collapsible component
   *
   * @param {array} products Array of products
   * @param {string} type included or addon
   * @generator Products
   */
  function *GeneralSettings ({}) {

    for (const _ of this) {
      yield (
        <div class="mt1 bb b--black-30">
          {hasOwnProp.call(fetchSettings, "General") && (
            <Fragment>
              {Object.keys(fetchSettings.General).map(el => (
                <div class="w-100">
                  <label
                    for={el}
                    class="f6 db mb2">
                      {getSetting("General", el)[0]}
                    </label>
                  <input 
                    id={el}
                    name="setting"
                    class="input-reset ba b--black-20 pa2 mv2 db w-100"
                    type="text" value={getSetting("General", el)[1]}
                  />
                </div>
              ))}
              <div class="tr w-100">
                <Button type="primary" onclick={saveEdit}>
                  Save
                </Button>
                <Button type="secondary" onclick={cancelEdit}>
                  Cancel
                </Button>
              </div>
            </Fragment>
          )}
        </div>
      );
    };
  };

  /*
   * Wrap general settings in collapsible wrapper
   */
  const CollapsibleSettings = CollapseWrapper(GeneralSettings);

  /*
   * Control the collapse of general settings
   */
  const toggleCollapse = () => {
    collapsedSettings = !collapsedSettings;
    this.refresh();
  };


  for (const _ of this) {
    yield (
      <div class="f6 pb2">
        {loading && <BarLoader />}
        <div class="mt3" id="settings-table">
          {fetchError && <Error msg={fetchError} />}
          {Object.keys(fetchSettings).length > 0 && (
            <Fragment>
              {hasOwnProp.call(fetchSettings, "General") && (
                  <div class="dn">{JSON.stringify(fetchSettings.General)}</div>
              )}
              <div class="">
                <div class="w-40-ns fl">
                  <AppView settings={appSettings} />
                </div>
                <div class="w-60-ns fl ph3">
                  <h2 class="pt0 f5 f4-ns lh-title-ns ma0 fg-streamside-maroon">
                    Settings
                  </h2>
                  <div class="pb3">
                    <h3 class="fw3 bb b--black-30 pointer"
                      onclick={toggleCollapse}
                      >
                      General Settings
                      <span class="v-mid">
                        {collapsedSettings ? <CaretDownIcon /> : <CaretUpIcon />}
                      </span>
                    </h3>
                    <CollapsibleSettings collapsed={collapsedSettings} id="general-settings" />
                  </div>
                  <h3 class="fw3 bb b--black-30">Other Settings</h3>
                  <div id="other-settings">
                    <div class="bold f5 fw3 pv2 fg-streamside-maroon">
                      Hover over the pictured box app to find and change available settings.
                    </div>
                    {hasOwnProp.call(selectedSettings, "Translation") && (
                      <Fragment>
                        <h4 class="fw3 bb b--black-30">Translations</h4>
                        <div>
                          {selectedSettings["Translation"].map(el => (
                            <div class="w-100">
                              <label
                                for={el}
                                class="f6 db mb2">
                                  {getSetting("Translation", el)[0]}
                                </label>
                              <input 
                                id={el}
                                name="setting"
                                class="input-reset ba b--black-20 pa2 mv2 db w-100"
                                type="text" value={getSetting("Translation", el)[1]} />
                            </div>
                          ))}
                        </div>
                      </Fragment>
                    )}
                    {hasOwnProp.call(selectedSettings, "Colour") && (
                      <Fragment>
                        <h4 class="fw3 bb b--black-30">Colours <span class="fw2">(click to edit)</span></h4>
                        <div>
                          {selectedSettings["Colour"].map(el => (
                            <div>
                              <input 
                                id={el}
                                name="setting"
                                class="pickr input-reset ba b--black-20 pa2 mv2 dib"
                                type="color" value={getSetting("Colour", el)[1]} />
                              <label
                                for={el}
                                class="f6 dib ma2">
                                  {getSetting("Colour", el)[0]}
                              </label>
                            </div>
                          ))}
                        </div>
                      </Fragment>
                    )}
                    {editing && (
                      <div class="tr w-100">
                        <Button type="primary" onclick={saveEdit}>
                          Save
                        </Button>
                        <Button type="secondary" onclick={cancelEdit}>
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div class="cf"></div>
            </Fragment>
          )}
        </div>
      </div>
    );
  };
}

export default Settings;
