/** @jsx createElement */
/**
 * Starting point of url route /subscribers
 *
 * @module app/route/subscribers
 * @exports Subscribers
 * @requires module:app/subscribers
 * @author Darryl Cousins <darryljcousins@gmail.com>
 */
import { createElement, Fragment } from "@bikeshaving/crank/cjs";
import CurrentSubscribers from "../components/subscribers-current";

/**
 * Route for subscribers, linked from navigation
 *
 * @function
 * @returns {Element} DOM component
 * @example
 * import {renderer} from '@bikeshaving/crank/cjs/dom';
 * renderer.render(<Subscribers />, document.querySelector('#app'))
 */
function Subscribers() {
  return (
    <CurrentSubscribers />
  );
}

export default Subscribers;


