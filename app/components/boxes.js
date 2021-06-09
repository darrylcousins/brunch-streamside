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
import { sortObjectByKey } from "../helpers";
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

  /**
   * Switch box tabs
   *
   * @function boxTab
   * @param {event} ev A click event on this element
   * @listens this.click
   */
  const boxTab = async (ev) => {
    const name = ev.target.tagName;
    if (name === "LABEL" || name === "H2") {
      const { id } = ev.target;
      const color = "dark-green";
      const opacity = "o-40";
      if (id) {
        document.querySelectorAll("h2[name='tabs']").forEach((el) => {
          if (el.id !== id) {
            el.classList.remove(color);
            el.classList.add(opacity);
          } else {
            el.classList.add(color);
            el.classList.remove(opacity);
          }
        });
      }
    }
  };

  this.addEventListener("click", boxTab);

  while (true)
    yield (
      <div class="overflow-auto">
        {Object.keys(boxes).length > 0 && (
          <div class="tabs center">
            <div class="tabs__menu dt dt--fixed mb2 bb b--black-20">
              {Object.keys(boxes).map((key, index) => (
                <label
                  htmlFor={key.replace(" ", "-")}
                  for={key.replace(" ", "-")}
                  class="tabs__menu-item dtc tc bg-white pt1 pb2 bg-animate hover-bg-near-white pointer"
                >
                  <h2
                    class={`mv0 f6 f5-ns lh-title-ns ttu tracked ${
                      index !== 0 && "o-40"
                    } ${index === 0 && "dark-green"}`}
                    id={`${key.replace(" ", "-")}-key`}
                    name="tabs"
                  >
                    {key}
                  </h2>
                </label>
              ))}
            </div>
            <div class="tabs__content">
              {Object.keys(boxes).map((key, index) => (
                <div>
                  <input
                    type="radio"
                    class="dn"
                    name="sections"
                    id={key.replace(" ", "-")}
                    checked={index === 0}
                  />
                  <div class="tabs__content__info">
                    <table class="f6 w-100 center" cellSpacing="0">
                      <thead>
                        <tr>
                          <th class="fw6 bb b--black-20 tl pb3 pr3 bg-white">
                            Delivery Date
                          </th>
                          <th class="fw6 bb b--black-20 tl pb3 pr3 bg-white">
                            Title
                          </th>
                          <th class="fw6 bb b--black-20 tl pb3 pr3 bg-white">
                            Including
                          </th>
                          <th class="fw6 bb b--black-20 tl pb3 pr3 bg-white">
                            Extras
                          </th>
                          <th class="fw6 bb b--black-20 tl pb3 pr3 bg-white">
                            Price
                          </th>
                        </tr>
                      </thead>
                      <tbody class="lh-copy">
                        {boxes[key].map(
                          (box, idx) => (
                            <Box index={idx} box={box} />
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
}

export default Boxes;
