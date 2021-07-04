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
import { CloseIcon } from "../lib/icon";
import { Fetch } from "../lib/fetch";
import { animateFadeForAction, hasOwnProp } from "../helpers";
import Form from "../form";
import Button from "../lib/button";
import BarLoader from "../lib/bar-loader";
import IconButton from "../lib/icon-button";
import RulesForm from "./box-rules-form";
import BoxRule from "./box-rule";
import CollapseWrapper from "./collapse-animator";

/**
 * Display a modal containing {@link
 * module:app/components/order-detail~OrderDetail|OrderDetail}
 *
 * @generator
 * @yields {Element} DOM element displaying modal
 * @param {object} props Property object
 * @param {object} props.order The order to be displayed
 */
function* BoxRulesModal({ }) {

  /**
   * Hold visibility state of this modal
   *
   * @member {boolean} visible
   */
  let visible = false;
  /**
   * Hold loading state.
   *
   * @member {boolean} loading
   */
  let loading = true;
  /**
   * Hold collapsed state of add form
   *
   * @member {boolean} collapsed
   */
  let collapsed = true;
  /**
   * Box rules as collected from api
   *
   * @member {array} fetchRules
   */
  let fetchRules = [];

  /*
   * Control the collapse of product list
   * @function toggleCollapse
   */
  const toggleCollapse = () => {
    collapsed = !collapsed;
    if (document.getElementById("add-rule-button")) {
      animateFadeForAction("add-rule-button", async () => await this.refresh());
    } else if (document.getElementById("box-rules-add-form")) {
      animateFadeForAction("box-rules-add-form", async () => await this.refresh());
    } else {
      this.refresh();
    };
  };

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

  const main = document.getElementById("modal-window");

  /**
   * Fetch rules data on mounting of component
   *
   * @function getRules
   */
  const getRules = () => {
    let uri = "/api/current-box-rules";
    Fetch(uri)
      .then((result) => {
        const { error, json } = result;
        if (error !== null) {
          console.warn(error);
          loading = false;
          this.refresh();
        } else {
          loading = false;
          fetchRules = json;
          if (document.getElementById("box-rules-table")) {
            animateFadeForAction("box-rules-table", async () => await this.refresh());
          } else {
            this.refresh();
          };
        }
      })
      .catch((err) => {
        loading = false;
        this.refresh();
      });
  };

  getRules();

  /**
   * Event handler when rule added with RulesAddForm or edited with RulesForm
   *
   * @function reloadRules
   * @param {object} ev The event
   * @listens box.rules.reload
   */
  const reloadRules = (ev) => {
    getRules();
  };

  //this.addEventListener("box.rules.reload", reloadRules);
  this.addEventListener("listing.reload", reloadRules); // from form remove

  /*
   * Wrap add rules form
   */
  const RulesAddForm = CollapseWrapper(RulesForm);

  while (true)
    yield (
      <Fragment>
        {loading && <BarLoader />}
        <div onclick={openModal}>
          <IconButton>
            <span style="width: 250px" class="db tl link f5 white pv1 pl3 pr2">Box rules</span>
          </IconButton>
        </div>
        {visible && (
          <Portal root={main}>
            <div
              class="db absolute left-0 w-100 h-100 z-1 bg-black-90 pa4 mt4"
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
                {collapsed && (
                <nav id="add-rule-button" class="ph3 pv2 pv3-ns tr">
                  <Button type="primary" title="Add Box Rule" onclick={toggleCollapse}>
                    <span>Add Box Rule</span>
                  </Button>
                </nav>
                )}
                <div class="mt3">
                    <RulesAddForm
                      collapsed={collapsed}
                      id="box-rules-add-form"
                      toggleCollapse={toggleCollapse}
                      rule={false}
                      disabled={false}
                    />
                </div>
                <div id="box-rules-table">
                  {fetchRules.length === 0 ? (
                    <div>No current box rules</div>
                  ) : (
                    fetchRules.map(rule => (
                      <BoxRule rule={rule} />
                    ))
                  )}
                </div>
                <div class="w-100 tr">
                  <Button
                    type="secondary"
                    title="Close rules"
                    onclick={closeModal}
                  >
                    Close Rules
                  </Button>
                </div>
              </div>
            </div>
          </Portal>
        )}
      </Fragment>
    );
}

export default BoxRulesModal;

