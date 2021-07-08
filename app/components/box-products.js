/** @jsx createElement */
/**
 * Display the products for a box
 *
 * @module app/components/box
 * @exports Box
 * @author Darryl Cousins <darryljcousins@gmail.com>
 */
import { createElement } from "@bikeshaving/crank/cjs";
import CollapseWrapper from "./collapse-animator";
import AddProductToBoxModal from "./product-add";
import RemoveBoxModal from "./box-remove";
import { PostFetch } from "../lib/fetch";
import { CloseIcon, DownloadIcon, SaveAltIcon, EditIcon, DeleteIcon } from "../lib/icon";
import { sortObjectByKey } from "../helpers";

/**
 * Products component - will be wrapped in collapsible component
 *
 * @param {array} products Array of products
 * @param {string} type included or addon
 * @generator Products
 */
function *Products ({box, products, type, allproducts}) {

  /**
   * Save removal of product from product list
   *
   * @function removeProduct
   */
  const removeProduct = async ({shopify_product_id, product_type}) => {
    const headers = { "Content-Type": "application/json" };
    const data = { shopify_product_id, product_type, box_id: box._id };
    console.log('removing data', data);
    const { error, json } = await PostFetch({
      src: "/api/remove-product-from-box",
      data: { shopify_product_id, product_type, box_id: box._id },
      headers,
    })
      .then((result) => result)
      .catch((e) => ({
        error: e,
        json: null,
      }));
    if (!error) {
      // call on the parent to refresh, which turns out to be a simple and elegant solution that 'just works'
      this.dispatchEvent(
        new CustomEvent("listing.reload", {
          bubbles: true,
        })
      );
    }
    // need to provide user feedback of success or failure
    return { error, json };
  };

  const getNotType = (type) => {
    switch (type) {
      case "addOnProducts":
        return "includedProducts";
        break;
      case "includedProducts":
        return "addOnProducts";
        break;
      default:
        console.warn(`${type} is not correct`);
        return null;
        break;
    };
  };

  /**
   * Add product to product list
   *
   * @function removeProduct
   */
  const addProduct = async ({shopify_product_id, product_type}) => {
    const headers = { "Content-Type": "application/json" };
    const data = { shopify_product_id, product_type, box_id: box._id };
    console.log('adding data', data);
    const { error, json } = await PostFetch({
      src: "/api/add-product-to-box",
      data: { shopify_product_id, product_type, box_id: box._id },
      headers,
    })
      .then((result) => result)
      .catch((e) => ({
        error: e,
        json: null,
      }));
    if (!error) {
      // do nothing - removeProduct will force data refresh
    }
    // need to provide user feedback of success or failure
    return { error, json };
  };

  /**
   * Drag and drop products between lists
   *
   * @function dragEnter
   */
  const dragEnter = (ev) => {
    ev.preventDefault();
    const productList = ev.target.closest("div[name='product-list']");
    console.log("enter", productList.getAttribute("data-type"));
    ev.target.classList.add("bb", "b--gold");
  };

  /**
   * Drag and drop products between lists
   *
   * @function dragLeave
   */
  const dragLeave = (ev) => {
    ev.preventDefault();
    const productList = ev.target.closest("div[name='product-list']");
    console.log("leave", productList.getAttribute("data-type"));
    ev.target.classList.remove("bb", "b--gold");
  };

  /**
   * Drag and drop products between lists
   *
   * @function allowDrop
   */
  const dragOver = (ev) => {
    ev.preventDefault();
  };

  /**
   * Drag and drop products between lists
   *
   * @function dragEnd
   */
  const dragEnd = (ev) => {
    const shopify_product_id = ev.target.getAttribute("data-id");
    document.getElementById(`${shopify_product_id}`).classList.remove("o-30");
    [...document.getElementsByClassName("b--gold")].forEach(el => el.classList.remove("bb", "b--gold"));
  };

  /**
   * Drag and drop products between lists
   *
   * @function dragStart
   */
  const dragStart = (ev) => {
    const shopify_product_id = ev.target.getAttribute("data-id");
    const product_type = ev.target.getAttribute("data-type");
    document.getElementById(`${shopify_product_id}`).classList.add("o-30");
    ev.dataTransfer.setData("text", `${product_type}:${shopify_product_id}`);
  };

  /**
   * Drag and drop products between lists
   *
   * @function drop
   */
  const drop = async (ev) => {
    ev.preventDefault();
    const [product_type, product_id] = ev.dataTransfer.getData("text").split(":");

    const nearest = ev.target.querySelector("div[draggable=true]");
    const target = nearest ? nearest : ev.target;
    const target_type = target.getAttribute("data-type");

    if (product_type !== target_type) {
      const shopify_product_id = parseInt(product_id);
      await addProduct({shopify_product_id, product_type: target_type});
      removeProduct({shopify_product_id, product_type});
    };

  };

  for ({ box, products, allproducts } of this) {
    yield (
      <div
        id={`${type}-${box._id}`}
        class="mt1"
      >
        <AddProductToBoxModal
          type={type}
          box={box}
          boxproducts={allproducts.map((el) => el.shopify_product_id)} />
        <div
          name="product-list"
          data-type={type}
          ondrop={drop}
          ondragover={dragOver}
          ondragenter={dragEnter}
          ondragleave={dragLeave}
          style={{height: products.length ? "auto" : "200px"}}
        >
        {products.map((el) => (
            <div
              class="w-100 dt hover-dark-blue"
              name="product-item"
              id={el.shopify_product_id}
              data-type={type}
            >
              <div class="dtc tl hover-dark-red pointer w-10"
                onclick={() => removeProduct({shopify_product_id: el.shopify_product_id, product_type: type})}
                title={`Remove ${el.shopify_title}`}>
                <span class="v-mid">
                  <CloseIcon />
                </span>
              </div>
              <div
                class="dtc w-90"
              >
                <div
                  class="dib w-100"
                  style={{cursor: "crosshair"}}
                  draggable="true"
                  ondragstart={dragStart}
                  ondragend={dragEnd}
                  data-id={el.shopify_product_id}
                  data-type={type}
                >{el.shopify_title}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };
};

/*
 * Wrap products in collapsible wrapper
 */
const CollapsibleProducts = CollapseWrapper(Products);
export default CollapsibleProducts;

