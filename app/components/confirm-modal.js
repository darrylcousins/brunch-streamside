/** @jsx createElement */
/**
 * Creates element to render a modal display in {@link
 * module:app/components/order-detail~OrderDetail|OrderDetail}
 *
 * @module app/components/box-rules
 * @exports BoxRulesModal
 * @author Darryl Cousins <darryljcousins@gmail.com>
 */
import { createElement, Fragment, Portal} from "@bikeshaving/crank/cjs";

/**
 * Display a modal containing {@link
 * module:app/components/order-detail~OrderDetail|OrderDetail}
 *
 * @generator
 * @yields {Element} DOM element displaying modal
 * @param {object} props Property object
 * @param {object} props.order The order to be displayed
 */
function* ConfirmModal({ }) {

  /**
   * Hold visibility state of this modal
   *
   * @member {boolean} visible
   */
  let visible = false;

  /**
   * Open the modal
   *
   * @function openModal
   */
  const openModal = () => {
    visible = true;
    this.refresh();
  };

  /**
   * Close the modal
   *
   * @function closeModal
   */
  const closeModal = () => {
    visible = false;
    this.refresh();
  };

  const main = document.getElementById("front-modal-window");

  while (true)
    yield (
      <Fragment>
        {loading && <BarLoader />}
        <div onclick={openModal}>
          <IconButton>
            <span style="width: 250px" class="db tl link f5 white pv1 pl3 pr2">Delete box rule</span>
          </IconButton>
        </div>
        {visible && (
          <Portal root={main}>
            <div
              class="db absolute absolute--fill w-100 h-100 z-1 bg-black-90 pa4 mt4"
              style={`top: ${Math.round(window.scrollY).toString()}px;`}
            >
              <div class="bg-white f6 pa4 br3 mw8 relative center">
                <button
                  class="bn bg-transparent outline-0 mid-gray dim o-70 absolute top-1 right-1 pointer"
                  name="close"
                  onclick={closeModal}
                  title="Close rules"
                  type="button"
                >
                  <CloseIcon />
                  <span class="dn">Close modal</span>
                </button>
                <div class="w-100 tr">
                  <Button
                    type="primary"
                    title="Confirm"
                    onclick={() => console.log("confirm")}
                  >
                    Confirm
                  </Button>
                  <Button
                    type="secondary"
                    title="Cancel"
                    onclick={closeModal}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </Portal>
        )}
      </Fragment>
    );
}

export default ConfirmModal;
