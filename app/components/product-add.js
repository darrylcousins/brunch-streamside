/** @jsx createElement */
/**
 * Creates element to render modal form to add a product to a box.
 *
 * @module app/components/product-add
 * @requires module:app/form/form-modal-wrapper~FormModalWrapper
 * @requires module:app/lib/icon-button~IconButton
 * @exports AddProductToBoxModal
 * @author Darryl Cousins <darryljcousins@gmail.com>
 */
import { createElement, Fragment } from "@bikeshaving/crank/cjs";

import Button from "../lib/button";
import { PostFetch } from "../lib/fetch";
import BarLoader from "../lib/bar-loader";
import Error from "../lib/error";
import FormModalWrapper from "../form/form-modal";
import Form from "../form";
import InputSelect from "../form/fields/input-select";

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
  const { title, showModal } = opts;
  return (
    <div
      class="dt w-100 ba br1 pa1 mv1 blue bg-washed-blue pointer"
      onclick={showModal}
      title={title}>
      <span class="dtc">{title}</span>
      <span class="dtc fa fa-plus tr" />
    </div>
  );
};

/**
 * Options object passed to module:app/components/form-modal~FormModalWrapper
 *
 * @member {object} options
 */
const options = {
  id: "add-product",
  title: "Add Product",
  color: "blue",
  src: "/api/add-product-to-box",
  ShowLink,
  saveMsg: "Adding selected product ...",
  successMsg: "Successfully added product, reloading page.",
};

/**
 * Get the products using search term
 *
 * @returns {object} Error (if any) and the products
 */
const getProducts = async ({search}) => {
  const headers = { "Content-Type": "application/json" };
  const { error, json } = await PostFetch({
    src: "/api/query-store-products",
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
 * Create a modal to selecte and add a product to a box
 *
 * @generator
 * @yields {Element} A form and remove/cancel buttons.
 * @param {object} props Property object
 * @param {Function} props.doSave - The save action
 * @param {Function} props.closeModal - The cancel and close modal action
 * @param {string} props.title - Form title
 * @param {object} props.order - The order to be removed
 * @param {string} props.formId - The unique form indentifier
 * @param {object} props.box - The box being edited
 * @param {array} props.boxproducts - The current array of products
 * @param {string} props.type - Included or addon
 */
async function* AddProductToBox(props) {
  const { doSave, closeModal, title, box, boxproducts, type, formId } = props;

  /**
   * Hold loading state.
   *
   * @member {boolean} loading
   */
  let loading = false;
  /**
   * Hold error state.
   *
   * @member {boolean} error
   */
  let error = false;
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
  let fields = {
    Product : { // selected from product list
      id: "shopify_product_id",
      type: "hidden",
      datatype: "string",
      required: true,
    },
    Box : { // populated by initial values
      id: "box_id",
      type: "hidden",
      datatype: "string",
      required: true,
    },
    Type : { // populated by initial values, included or addon
      id: "product_type",
      type: "hidden",
      datatype: "string",
      required: true,
    }
  };

  const saveProduct = ({id, title}) => {
    document.getElementById("add-product").shopify_product_id.value = id;
    doSave();
  };

  for await (const _ of this) { // eslint-disable-line no-unused-vars

    /**
     * The initial data of the form
     *
     * @function getInitialData
     * @returns {object} The initial data for the form
     * returns the order else compiles reasonable defaults.
     */
    const getInitialData = () => ({ box_id: box._id, product_type: type });

    const inputSearch = async () => {
      const search = document.getElementById("product-search").value;
      if (search === "") {
        products = [];
      } else {
        const result = await getProducts({search});
        error = result.error;
        products = result.products.filter(el => !boxproducts.includes(el.id));
        // need to also filter out from other product list i.e. cannont be both addon and included
      }
      this.refresh();
    };

    yield (
      <Fragment>
        {loading && <BarLoader />}
        {error ? (
          <Error msg={error} />
        ) : (
          <Fragment>
            <div class="near-black">
              <p class="lh-copy tl">
                Select product to add to
                <b class="pl1 near-black">{box.shopify_sku}</b> <span class="near-black">({box.delivered})</span>.
              </p>
              <div class="mt3">
                <label class="db fw6 lh-copy f6" for="product-search">Search</label>
                <input class="pa2 input-reset ba bg-transparent hover-bg-near-white w-100 br2" autofocus
                  type="text" name="product-search"  id="product-search" oninput={() => inputSearch()} />
              </div>
            </div>
            {products.length ? (
              products.map(el => (
                <div
                  class="near-black pointer hover-green pa1"
                  onclick={() => saveProduct(el)}>
                  {el.title}
                </div>
            ))) : ""}
            <Form
              data={getInitialData()}
              fields={fields}
              title={title}
              id={formId}
            />
            <div class="w-90 ph1">
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

export default FormModalWrapper(AddProductToBox, options);

