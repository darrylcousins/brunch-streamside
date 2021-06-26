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
import CurrentSettings from "../components/settings-current";

/**
 * Route for settings, linked from navigation
 *
 * @function
 * @returns {Element} DOM component
 * @example
 * import {renderer} from '@bikeshaving/crank/cjs/dom';
 * renderer.render(<Settings />, document.querySelector('#app'))
 */
function Settings() {
  return (
    <CurrentSettings />
  );
}

export default Settings;

