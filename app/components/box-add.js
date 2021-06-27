/** @jsx createElement */
/**
 * Creates element to render modal form to add a box
 *
 * @module app/components/box-add
 * @requires module:app/form/form-modal-wrapper~FormModalWrapper
 * @requires module:app/lib/icon-button~IconButton
 * @exports AddBoxModal
 * @author Darryl Cousins <darryljcousins@gmail.com>
 */
import { createElement, Fragment } from "@bikeshaving/crank/cjs";

import Button from "../lib/button";
import { Fetch, PostFetch } from "../lib/fetch";
import { AddIcon } from "../lib/icon";
import IconButton from "../lib/icon-button";
import BarLoader from "../lib/bar-loader";
import Error from "../lib/error";
import FormModalWrapper from "../form/form-modal";
import Form from "../form";
import { dateStringForInput } from "../helpers";

/**
 * Icon button for link to expand modal
 *
 * @function ShowLink
 * @param {object} opts Options that are passed to {@link module:app/lib/icon-button~IconButton|IconButton}
 * @param {string} opts.name Name as identifier for the action // optional
 * @param {string} opts.title Hover hint // optional
 * @param {string} opts.color String colour // optional
 * @param {string} opts.showModal Action function // optional
 * @returns {Element} An icon button
 */
const ShowLink = (opts) => {
  const { name, title, color } = opts;
  return (
    <IconButton color={color} title={title} name={name}>
      <AddIcon />
    </IconButton>
  );
};

/**
 * Options object passed to module:app/components/form-modal~FormModalWrapper
 *
 * @member {object} options
 */
const options = {
  id: "add-box",
  title: "Add Box",
  color: "navy",
  src: "/api/add-box",
  ShowLink,
  saveMsg: "Adding selected box ...",
  successMsg: "Successfully added box, reloading page.",
};

/**
 * Get the Container Box products using search term
 *
 * @returns {object} Error (if any) and the products
 */
const getProducts = async ({search}) => {
  const headers = { "Content-Type": "application/json" };
  const { error, json } = await PostFetch({
    src: "/api/query-store-boxes",
    data: { search },
    headers,
  })
    .then((result) => result)
    .catch((e) => ({
      error: e,
      json: null,
    }));
  if (!error) {
  }
  return { error, products: json };
}

/**
 * Get the fields, this only to ascertain if a core box exists
 *
 * @returns {object} Error (if any) and the fields
 */
const getAddFields = async (delivered) => {
  const uri = "/api/get-core-box";
  const { error, json } = await Fetch(uri)
    .then((result) => result)
    .catch((e) => ({
      error: e,
      json: null,
    }));
  const fields = {};
  if (!error) {
    fields.Box = { // selected from product list
      id: "shopify_product_id",
      type: "hidden",
      datatype: "integer",
      required: true,
    };
    fields.Delivered = {
      id: "delivered",
      type: "date", // needs to be calendar select
      size: "50",
      datatype: "date",
      required: true,
      min: dateStringForInput(),
    };
    if (json) {
      fields["Use Core Box"] = {
        id: "useCoreBox", // we have a core box
        type: "checkbox",
      };
    };
  }
  return { error, fields };
};

/**
 * Create a modal to select shopify box product to make a box
 *
 * @generator
 * @yields {Element} A form and cancel button.
 * @param {object} props Property object
 * @param {Function} props.doSave - The save action
 * @param {Function} props.closeModal - The cancel and close modal action
 * @param {string} props.title - Form title
 * @param {object} props.order - The order to be removed
 * @param {string} props.formId - The unique form indentifier
 */
async function* AddBox(props) {
  const { doSave, closeModal, title, delivered, formId } = props;

  /**
   * Hold loading state.
   *
   * @member {boolean} loading
   */
  let loading = false;
  /**
   * Hold formValid state.
   *
   * @member {boolean} formValid
   */
  let formValid = true;
  /**
   * Hold fetchError on collecting products
   *
   * @member {boolean} fetchError
   */
  let fetchError = false;
  /**
   * Hold shopify_product_id state.
   * This is the product id of the shopify box being added for the date
   *
   * @member {int} shopify_product_id
   */
  let shopify_product_id;
  /**
   * Products as result of search
   *
   * @member {boolean} products
   */
  let products = [];
  /**
   * Form fields passed to form
   *
   * @member {boolean} fields
   */
  const { error, fields } = await getAddFields(delivered);

  /**
   * The initial data of the form
   *
   * @function getInitialData
   * @returns {object} The initial data for the form
   */
  const getInitialData = () => {
    return {shopify_product_id, delivered: dateStringForInput(delivered)};
  };

  /**
   * Update products when search term entered
   *
   */
  const inputSearch = async () => {
    const search = document.getElementById("product-search").value;
    if (search === "") {
      products = [];
    } else {
      const result = await getProducts({search});
      fetchError = result.error;
      products = result.products;
    }
    this.refresh();
  };

  /**
   * Vaidate selected box before submitting form
   *
   */
  const saveBox = async () => {
    if (!document.getElementById("add-box").shopify_product_id.value && !shopify_product_id) {
      document.getElementById("product-search").classList.add("invalid");
      document.getElementById("product-search-alert").classList.remove("dn");
      document.getElementById("product-search-alert").classList.add("db");
    } else if (shopify_product_id) {
      document.getElementById("add-box").shopify_product_id.value = parseInt(shopify_product_id);
      /*
      console.log('shopify_product_id', shopify_product_id);
      console.log('add box value', document.getElementById("add-box").shopify_product_id.value);
      console.log('delivered value', document.getElementById("add-box").delivered.value);
      */
      doSave();
    };
  };

  /**
   * Update shopify_product_id hidden field on box selection
   *
   */
  const saveBoxId = ({id, title}) => {
    document.getElementById("add-box").shopify_product_id.value = id;
    document.getElementById(id.toString()).classList.remove("dn");
    document.getElementById("product-search-alert").classList.remove("db");
    document.getElementById("product-search-alert").classList.add("dn");
    shopify_product_id = id; // don't refresh because form data is lost
  };

  for await (const _ of this) { // eslint-disable-line no-unused-vars

    yield (
      <Fragment>
        {loading && <BarLoader />}
        {fetchError && <Error msg={fetchError} />}
        {error ? (
          <Error msg={error} />
        ) : (
          <Fragment>
            <div class="near-black">
              <p class="lh-copy tl">
                Select a delivery date and the container box from shopify store products.
              </p>
              <div class="tl ph2 mt1 ml0">
                <label class="db fw6 lh-copy f6" for="product-search">Search in store boxes</label>
                <input
                  class="mr1 pa2 ba bg-transparent hover-bg-near-white w-50 input-reset br2" required
                  type="text" name="product-search"  id="product-search" oninput={() => inputSearch()} />
                  <span
                    class={`small mt1 fg-streamside-orange ${formValid ? "dn" : "db"}`}
                    id="product-search-alert"
                  >
                  A box is required
                </span>
              </div>
              <div class="mt3 tl">
                {products.length ? (
                  products.map(el => (
                    <div
                      class="near-black pointer hover-green pa1"
                      onclick={() => saveBoxId(el)}>
                      <span class="fa fa-check dn" id={el.id} />{el.title}
                    </div>
                ))) : ""}
              </div>
            </div>
            <Form
              data={getInitialData()}
              fields={fields}
              title={title}
              id={formId}
            />
            <div class="w-90 ph1">
              <Button type="primary" onclick={saveBox}>
                Save
              </Button>
              <Button type="secondary" onclick={closeModal}>
                Cancel
              </Button>
            </div>
          </Fragment>
        )}
      </Fragment>
    );
  }
}

export default FormModalWrapper(AddBox, options);
