/** @jsx createElement */
import { createElement, Fragment } from "@bikeshaving/crank/cjs";
import { HelpIcon, CloseIcon } from "../lib/icon";

export default function* HelpSection({ children }) {
  let visible = false;

  const remove = () => {
    visible = false;
    this.refresh();
  };

  this.addEventListener("click", async (ev) => {
    const name = ev.target.tagName.toUpperCase();
    if (name === "SVG" || name === "PATH") {
      visible = !visible;
      this.refresh();
    } else {
      remove();
    }
  });

  while (true)
    yield (
      <Fragment>
        {!visible ? (
          <button
            class="pointer bn bg-transparent outline-0 mid-gray dim o-70 absolute top-1 right-1"
            name="open"
            title="Get further info"
            type="button"
          >
            <HelpIcon />
            <span class="dn">Get info</span>
          </button>
        ) : (
          <Fragment>
            <button
              class="pointer bn bg-transparent outline-0 mid-gray dim o-70 absolute top-1 right-1"
              name="close"
              title="Close info"
              type="button"
            >
              <CloseIcon />
              <span class="dn">Close info</span>
            </button>
            {children}
          </Fragment>
        )}
      </Fragment>
    );
}
