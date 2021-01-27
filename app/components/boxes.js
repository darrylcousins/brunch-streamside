/** @jsx createElement */
/**
 * Starting point of url route /boxes
 *
 * @module app/route/boxes
 * @exports Boxes
 * @requires module:app/boxes-current
 * @author Darryl Cousins <darryljcousins@gmail.com>
 */
import { createElement } from "@bikeshaving/crank/cjs";
import CurrentBoxes from "./partials/boxes-current";

/**
 * Route to boxes, linked from navigation
 *
 * @function
 * @returns {Element} Renders <CurrentBoxes />
 * @example
 * import {renderer} from '@bikeshaving/crank/cjs/dom';
 * renderer.render(<Box />, document.querySelector('#app'))
 */
function Boxes() {
  return <CurrentBoxes />;
}

export default Boxes;
