/** @jsx createElement */
/**
 * Starting point of url route /packing-lists
 *
 * @module app/route/packinglists
 * @exports PackingList
 * @requires module:app/packing-lists
 * @author Darryl Cousins <darryljcousins@gmail.com>
 */
import { createElement } from "@bikeshaving/crank/cjs";
import PackingLists from "../components/packing-lists";

/**
 * Route for packing-lists, linked from navigation
 *
 * @function
 * @returns {Element} DOM component
 * @example
 * import {renderer} from '@bikeshaving/crank/cjs/dom';
 * renderer.render(<PackingList />, document.querySelector('#app'))
 */
function PackingList() {
  return (
    <PackingLists />
  );
}

export default PackingList;
