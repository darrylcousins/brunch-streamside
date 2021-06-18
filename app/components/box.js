/** @jsx createElement */
/**
 * Display a table row of box details
 *
 * @module app/components/box
 * @exports Box
 * @author Darryl Cousins <darryljcousins@gmail.com>
 */
import { createElement } from "@bikeshaving/crank/cjs";
import CollapseWrapper from "./collapse-animator";
import AddProductToBoxModal from "./product-add";
import RemoveBoxModal from "./box-remove";
import Products from "./box-products";
import { PostFetch } from "../lib/fetch";
import { CaretUpIcon, CaretDownIcon, CloseIcon, DownloadIcon, SaveAltIcon, EditIcon, DeleteIcon } from "../lib/icon";
import { sortObjectByKey } from "../helpers";

/**
 * Constructs and returns a table row for the box
 *
 * @function
 * @returns {Element} - a html table row of the box
 * @param {object} props Property object
 * @param {object} props.box The box to by displayed
 * @param {object} props.index The index of boxes array
 * @example
 * const box = {
 *    shopify_sku: 'Big Vege',
 *    delivered: 'Thu Jan 28 2021',
 *    includedProducts: []
 *    ...
 *    }
 *  <Box box={box} />
 */
function *Box({ box, index }) {

  /**
   * Hold collapsed state of product listings
   *
   * @member {boolean} collapsed
   */
  let collapsed = true;

  /*
   * Wrap products in collapsible wrapper
   */
  const toggleCollapse = () => {
    collapsed = !collapsed;
    this.refresh();
  };

  for ({box} of this) { // eslint-disable-line no-unused-vars
    const allBoxProducts = box.includedProducts.concat(box.addOnProducts);
    yield (
      <tr key={index}>
        <td data-title="Delivered" class="w-10-l pv3 pr3 bb b--black-20 black-70 v-top">
          {new Date(box.delivered).toLocaleDateString()}
        </td>
        <td data-title="SKU" class="w-20-l pv3 pr3 bb b--black-20 v-top">
          <strong>{box.shopify_sku}</strong>
        </td>
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
            allproducts={allBoxProducts}
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
            allproducts={allBoxProducts}
            collapsed={collapsed}
            type="addOnProducts"
            box={box}
            id={`addons-${box.shopify_product_id}`}
          />
        </td>
        <td data-title="Price" class="w-10-l pv3 pr3 bb b--black-20 rh-copy black-70 v-top">
          ${parseFloat(box.shopify_price / 100).toFixed(2)}
        </td>
        <td data-title="Remove" class="w-10-l pv3 pr3 bb b--black-20 rh-copy black-70 v-top">
          <RemoveBoxModal box={box} />
        </td>
      </tr>
    );
  };
}

export default Box;
