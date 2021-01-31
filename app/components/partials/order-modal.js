/** @jsx createElement */
/**
 * Creates element to render a modal display in {@link
 * module:app/components/order-detail~OrderDetail|OrderDetail}
 *
 * @module app/components/order-modal
 * @exports OrderModal
 */
import { createElement, Fragment } from "@bikeshaving/crank/cjs";
import { CloseIcon } from "../lib/icon";
import OrderDetail from "./order-detail";
import Button from "../lib/button";

/**
 * Display a modal containing {@link
 * module:app/components/order-detail~OrderDetail|OrderDetail}
 *
 * @generator
 * @yields {Element} DOM element displaying modal
 * @param {object} props Property object
 * @param {object} props.order The order to be displayed
 */
function* OrderModal({ order }) {
  /**
   * Hold visibility state.
   *
   * @member {boolean} visible
   */
  let visible = false;

  /**
   * Close the modal
   *
   * @function closeModal
   */
  const closeModal = () => {
    visible = false;
    this.refresh();
  };

  /**
   * Hide the modal
   *
   * @function hideModal
   * @param {object} ev Event emitted
   * @listens window.click
   * @listens window.keyup
   */
  const hideModal = async (ev) => {
    if (ev.target && ev.target.tagName === "BUTTON") {
      visible = !visible;
      this.refresh();
    }
    if (ev.key && ev.key === "Escape") {
      closeModal();
      this.refresh();
    }
  };

  this.addEventListener("click", hideModal);

  this.addEventListener("keyup", hideModal);

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
              <OrderDetail order={order} />
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

export default OrderModal;
