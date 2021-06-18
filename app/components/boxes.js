/** @jsx createElement */
/**
 * Creates element to render array of boxes
 *
 * @module app/components/boxes
 * @requires module:app/components/box~Box
 * @exports Boxes
 * @author Darryl Cousins <darryljcousins@gmail.com>
 */
import { createElement } from "@bikeshaving/crank/cjs";
import Box from "./box";

/**
 * Create tabbed page of boxes by date and sets up tables for box details
 *
 * @generator
 * @yields {Element} - a html table display of the boxes
 * @param {object} props Property object
 * @param {Array} props.boxes - The array of boxes to by displayed
 */
function* Boxes({ boxes }) {

  for ({boxes} of this) { // eslint-disable-line no-unused-vars
    yield (
      <div class="mt2">
        <div class="cf">&nbsp;</div>
        <table class="f6 mt2 w-100 center" cellSpacing="0">
          <thead>
            <tr>
              <th class="fw6 bb b--black-20 tl pv3 pr3 bg-white sticky">
                Delivery
              </th>
              <th class="fw6 bb b--black-20 tl pv3 pr3 bg-white sticky">
                Title
              </th>
              <th class="fw6 bb b--black-20 tl pv3 pr3 bg-white sticky">
                Including
              </th>
              <th class="fw6 bb b--black-20 tl pv3 pr3 bg-white sticky">
                Extras
              </th>
              <th class="fw6 bb b--black-20 tl pv3 pr3 bg-white sticky">
                Price
              </th>
              <th class="fw6 bb b--black-20 tl pv3 pr3 bg-white sticky">
                &nbsp;
              </th>
            </tr>
          </thead>
          <tbody class="lh-copy">
            {boxes.map(
              (box, idx) => (
                <Box index={idx} box={box} />
              )
            )}
          </tbody>
        </table>
      </div>
    );
  };
}

export default Boxes;
