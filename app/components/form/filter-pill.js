/** @jsx createElement */
import { createElement } from "@bikeshaving/crank/cjs";

function* FilterPill({ name, type, callback }) {
  this.addEventListener("click", () => {
    callback(name, type);
  });

  while (true)
    yield (
      <span class="ba pv1 ph2 ml2 br2 f6 bg-black-10 dim pointer">
        {name}
        &nbsp; &#x2716;
      </span>
    );
}

export default FilterPill;
