/** @jsx createElement */
import { createElement } from "@bikeshaving/crank/cjs";
import { sortObjectByKey } from "./lib";
import Box from "./box";

export default function* Boxes({ boxes }) {

  this.addEventListener("click", async (ev) => {
    const name = ev.target.tagName;
    if (name === "LABEL" || name === "H2") {
      const { id } = ev.target;
      const color = "dark-green";
      const opacity = "o-40";
      if (id) {
        document.querySelectorAll("h2[name='tabs']").forEach((el) => {
          if (el.id !== id) {
            console.log(el.id, "not clicked");
            el.classList.remove(color);
            el.classList.add(opacity);
          } else {
            console.log(id, "clicked!");
            el.classList.add(color);
            el.classList.remove(opacity);
          }
        });
      }
    }
  });

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
                        {sortObjectByKey(boxes[key], "shopify_sku").map(
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
