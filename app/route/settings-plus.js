/** @jsx createElement */
/**
 * Starting point of url route /settings
 *
 * @module app/route/settings
 * @exports Settings
 * @requires module:app/settings
 * @author Darryl Cousins <darryljcousins@gmail.com>
 */
import { createElement, Fragment } from "@bikeshaving/crank/cjs";
import SettingsPlus from "../components/settings-plus";

/**
 * Route for settings
 * XXX Not for the general user - see CurrentSettings for user interface to settings
 *
 * @function
 * @returns {Element} DOM component
 * @example
 * import {renderer} from '@bikeshaving/crank/cjs/dom';
 * renderer.render(<Settings />, document.querySelector('#app'))
 */
function Settings() {
  return (
    <SettingsPlus />
  );
}

export default Settings;

