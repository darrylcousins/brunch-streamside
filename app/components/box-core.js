/** @jsx createElement */
/**
 * Creates element to render a modal to edit the core box
 *
 * @module app/components/box-core
 * @exports BoxCoreModal
 * @author Darryl Cousins <darryljcousins@gmail.com>
 */
import { createElement, Fragment, Portal } from "@bikeshaving/crank/cjs";
import { AddIcon, CaretUpIcon, CaretDownIcon, CloseIcon, DeleteIcon } from "../lib/icon";
import { PostFetch, Fetch } from "../lib/fetch";
import Button from "../lib/button";
import BarLoader from "../lib/bar-loader";
import IconButton from "../lib/icon-button";
import Products from "./box-products";
import { sortObjectByKey } from "../helpers";

/**
 * Creates element to render a modal to edit the core box
 *
 * @generator
 * @yields {Element} DOM element displaying modal
 * @param {object} props Property object
 * @param {object} props.order The order to be displayed
 */
function* BoxCoreModal() {
  /**
   * Hold visibility state.
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
   * Are we in process of creating box
   *
   * @member {boolean} creating
   */
  let creating = true;
  /**
   * Has the box been deleted
   *
   * @member {boolean} deleted
   */
  let deleted = false;
  /**
   * Menu text, dependent on existance of core box
   *
   * @member {string} menuText
   */
  let menuText = "";
  /**
   * The core box object
   *
   * @member {string} box
   */
  let box = null
  /**
   * Hold collapsed state of product listings
   *
   * @member {boolean} collapsed
   */
  let collapsed = false;

  /*
   * Toggle collapse of product listings
   */
  const toggleCollapse = () => {
    collapsed = !collapsed;
    this.refresh();
  };

  /**
   * Create the core box if not exists
   *
   * @function createCoreBox
   */
  const createCoreBox = () => {
    const headers = { "Content-Type": "application/json" };
    PostFetch({
      src: "/api/create-core-box",
      data: {},
      headers,
    })
      .then((result) => {
        console.log(result);
        if (!result.formError && !result.error) {
          console.log('Created core box');
          loading = false;
          creating = false;
          box = result.json;
          console.log(box);
          this.refresh();
        };
      })
      .catch((e) => {
        console.log("Got an error");
        return;
      });
  };

  /**
   * Delete the core box
   *
   * @function deleteCoreBox
   */
  const deleteCoreBox = () => {
    loading = true;
    this.refresh();
    const headers = { "Content-Type": "application/json" };
    PostFetch({
      src: "/api/delete-core-box",
      data: {},
      headers,
    })
      .then((result) => {
        console.log(result);
        if (!result.formError && !result.error) {
          getCoreBox(); // if error !?
        };
      })
      .catch((e) => {
        console.log("Got an error");
        return;
      });
  };

  /**
   * Get menu text
   *
   * @function getMenuText
   */
  const getMenuText = () => {
    return box ? "Edit core box" : "Create a core box" ;
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
   * Open the modal
   *
   * @function openModal
   */
  const openModal = () => {
    visible = true;
    if (!box) {
      loading = true;
      creating = true;
      // create the core box
      console.log('creating core box');
      createCoreBox();
    } else {
      loading = false;
      creating = false;
    };
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
    };
    if (ev.key && ev.key === "Escape") {
      closeModal();
      this.refresh();
    };
  };

  this.addEventListener("click", hideModal);

  this.addEventListener("keyup", hideModal);

  /**
   * Fetch core box if it exists to set up sideMenu
   *
   * @function getBoxes
   */
  const getCoreBox = () => {
    let uri = `/api/get-core-box`;
    Fetch(uri)
      .then((result) => {
        const { error, json } = result;
        if (error !== null) {
          fetchError = error;
          this.refresh();
        } else {
          console.log(json);
          /*
          if (json === null) {
            menuText = "Create a core box";
          } else {
            menuText = "Edit core box";
          };
          */
          box = json;
          loading = false;
          deleted = false;
          this.refresh();
        }
      })
      .catch((err) => {
        fetchError = err;
        this.refresh();
      });
  };

  /**
   * Event handler when {@link
   * module:form/form-modal~FormModalWrapper|FormModalWrapper} saves the data
   *
   * @function reloadBoxes
   * @param {object} ev The event
   * @listens boxes.reload
   */
  const reloadBox = (ev) => {
    getCoreBox();
  };

  this.addEventListener("boxes.reload", reloadBox);

  // use as root for the element
  const main = document.getElementById("main");

  getCoreBox();

  for (const _ of this) { // eslint-disable-line no-unused-vars
    yield (
      <Fragment>
        <div onclick={openModal}>
          <IconButton>
            <span style="width: 250px" class="db tl link f5 white pv1 pl3 pr2">{getMenuText()}</span>
          </IconButton>
        </div>
        {visible && (
          <Portal root={main}>
            <div
              class="db absolute left-0 w-100 h-100 z-1 bg-black-90 pa4 mt4"
              style={`top: ${Math.round(window.scrollY).toString()}px;`}
            >
              <div class="bg-white pa4 br3 f6 mw8 center relative">
                <button
                  class="bn bg-transparent outline-0 mid-gray dim o-70 absolute top-1 right-1 pointer"
                  name="close"
                  onclick={closeModal}
                  title="Close info"
                  type="button"
                >
                  <CloseIcon />
                  <span class="dn">Close add modal</span>
                </button>
                <div>
                  {loading && <BarLoader />}
                  {creating && (
                    <div class="mv2 pt2 pl2 br3 dark-green ba b--dark-green bg-washed-green">
                      <p class="tc">Creating the core box ...</p>
                    </div>
                  )}
                  {!box && (
                    <div class="mv3 pt2 pl2 br3 dark-green ba b--dark-green bg-washed-green">
                      <p class="tc">
                        No core box
                      </p>
                      <div class="tr" onclick={createCoreBox}>
                        <IconButton color="navy" title="Create core box" name="Create core box">
                          <AddIcon />
                        </IconButton>
                      </div>
                    </div>
                  )}
                  {box && (
                    <Fragment>
                      <div class="tc center">
                        <h2 class="fw4 fg-streamside-maroon">Edit The Core Box</h2>
                      </div>
                      <div class="tr">
                        <button
                          class="bn bg-transparent outline-0 dark-red dim pointer"
                          name="delete"
                          onclick={deleteCoreBox}
                          title="Delete core box"
                          type="button"
                        >
                          <DeleteIcon />
                          <span class="dn">Delete core box</span>
                        </button>
                      </div>
                      <table>
                        <td data-title="Included" class="w-30-l pv3 pr3 bb b--black-20 black-50 v-top">
                          <div class="dt dt--fixed hover-dark-green pointer"
                            onclick={toggleCollapse}>
                            <span class="dtc">
                              {box.includedProducts.length} included products
                            </span>
                            <span class="v-mid">
                              {collapsed ? (
                                <CaretDownIcon />
                              ) : (
                                <CaretUpIcon />
                              )}
                            </span>
                          </div>
                          <Products 
                            products={sortObjectByKey(box.includedProducts, "shopify_title")}
                            allproducts={box.includedProducts.concat(box.addOnProducts)}
                            collapsed={collapsed}
                            type="includedProducts"
                            box={box}
                            id={`included-${box.shopify_product_id}`}
                          />
                        </td>
                        <td data-title="Add Ons" class="w-30-l pv3 pr3 bb b--black-20 black-50 v-top">
                          <div class="dt dt--fixed hover-dark-green pointer"
                              onclick={toggleCollapse}>
                            <span class="dtc">
                              {box.addOnProducts.length} add on products
                            </span>
                            <span class="v-mid">
                              {collapsed ? (
                                <CaretDownIcon />
                              ) : (
                                <CaretUpIcon />
                              )}
                            </span>
                          </div>
                          <Products 
                            products={sortObjectByKey(box.addOnProducts, "shopify_title")}
                            allproducts={box.includedProducts.concat(box.addOnProducts)}
                            collapsed={collapsed}
                            type="addOnProducts"
                            box={box}
                            id={`addons-${box.shopify_product_id}`}
                          />
                        </td>
                      </table>
                    </Fragment>
                  )}
                </div>
              </div>
            </div>
          </Portal>
        )}
      </Fragment>
    );
  };
}

export default BoxCoreModal;
