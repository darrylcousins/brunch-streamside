/** @jsx createElement */
import { createElement, Fragment } from "@bikeshaving/crank/cjs";
import { CloseIcon } from "../lib/icon";
import OrderDetail from "./order-detail";
import Button from "../lib/button";

export default function* OrderModal({ row }) {
  let visible = false;

  const remove = () => {
    visible = false;
    this.refresh();
  };

  const closeModal = () => {
    visible = false;
    this.refresh();
  };

  this.addEventListener("click", async (ev) => {
    if (ev.target.tagName === "BUTTON") {
      visible = !visible;
      this.refresh();
    }
  });

  this.addEventListener("keyup", async (ev) => {
    if (ev.key === "Escape") {
      remove();
    }
  });

  while (true)
    yield (
      <Fragment>
        <Button>Show details</Button>
        {visible && (
          <div
            class="db absolute left-0 w-100 h-100 z-1 bg-black-90 pa4"
            style={`top: ${Math.round(window.scrollY).toString()}px;`}
          >
            <div class="bg-white pa4 br3">
              <button
                class="bn bg-transparent outline-0 mid-gray dim o-70 absolute top-1 right-1"
                name="close"
                onclick={closeModal}
                style="margin-right: 30px; margin-top: 30px;"
                title="Close info"
                type="button"
              >
                <CloseIcon />
                <span class="dn">Close add modal</span>
              </button>
              <OrderDetail order={row} />
              <div class="w-100 tr">
                <Button
                  type="secondary"
                  title="Close window"
                  onclick={closeModal}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </Fragment>
    );
}
