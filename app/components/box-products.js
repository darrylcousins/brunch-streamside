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
  const removeProduct = async ({box_id, shopify_product_id, product_type}) => {
    console.log(box_id, shopify_product_id, product_type);
    const headers = { "Content-Type": "application/json" };
    const { error, json } = await PostFetch({
      src: "/api/remove-product-from-box",
      data: { box_id, shopify_product_id, product_type },
      headers,
    })
      .then((result) => result)
      .catch((e) => ({
        error: e,
        json: null,
      }));
    if (!error) {
      //products = products.filter(el => el.shopify_product_id !== shopify_product_id);
      //this.refresh(); // does not change the list on the next yield
      // call on the parent to refresh, which turns out to be a simple and elegant solution that 'just works'
      this.dispatchEvent(
        new CustomEvent("boxes.reload", {
          bubbles: true,
        })
      );
    }
    // need to provide user feedback of success or failure
    return { error, json };
  };

  for ({ box, products, allproducts } of this) {
    yield (
      <div class="mt1">
        <AddProductToBoxModal
          type={type}
          box={box}
          boxproducts={allproducts.map((el) => el.shopify_product_id)} />
        {products.map((el) => (
          <div class="w-100 dt hover-dark-blue">
            <div class="dtc tl hover-dark-red pointer w-10"
              onclick={() => removeProduct({box_id: box._id, shopify_product_id: el.shopify_product_id, product_type: type})}
              title={`Remove ${el.shopify_title}`}>
              <span class="v-mid">
                <CloseIcon />
              </span>
            </div>
            <div class="dtc w-90">
              <span class="">{el.shopify_title}</span>
            </div>
          </div>
        ))}
      </div>
    );
  };
};

/*
 * Wrap products in collapsible wrapper
 */
const CollapsibleProducts = CollapseWrapper(Products);
export default CollapsibleProducts;

