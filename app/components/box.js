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
import {
  CaretUpIcon,
  CaretDownIcon,
  DeleteIcon,
  ToggleOnIcon,
  ToggleOffIcon,
} from "../lib/icon";
import IconButton from "../lib/icon-button";
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
function* Box({ box, index }) {
  /**
   * Hold collapsed state of product listings
   *
   * @member {boolean} collapsed
   */
  let collapsed = true;

  /*
   * Control the collapse of product list
   * @function toggleCollapse
   */
  const toggleCollapse = () => {
    collapsed = !collapsed;
    this.refresh();
  };

  /*
   * Submit form to toggle box on/off active
   * @function toggleBox
   */
  const toggleBox = async (data) => {
    const headers = { "Content-Type": "application/json" };
    const { error, json } = await PostFetch({
      src: "/api/toggle-box-active",
      data,
      headers,
    })
      .then((result) => result)
      .catch((e) => ({
        error: e,
        json: null,
      }));
    if (!error) {
      this.dispatchEvent(
        new CustomEvent("boxes.reload", {
          bubbles: true,
        })
      );
    }
    // need to provide user feedback of success or failure
    return { error, json };
  };

  /**
   * Event listener for toggling box on/off active
   *
   */
  this.addEventListener("click", async (ev) => {
    let target = ev.target;
    if (["PATH", "SVG"].includes(target.tagName.toUpperCase())) {
      target = target.closest("button");
    };
    const name = target.tagName.toUpperCase();
    let data;
    if (name === "BUTTON") {
      const box_id = box._id;
      switch(target.getAttribute("name")) {
        case "toggle-on":
          console.log('Toggle ON', box._id);
          ev.stopPropagation();
          data = {
            box_id,
            active: true,
          };
          await toggleBox(data);
          break;
        case "toggle-off":
          console.log('Toggle OFF', box._id);
          ev.stopPropagation();
          data = {
            box_id,
            active: false,
          };
          await toggleBox(data);
          break;
      };
    };
  });

  for ({ box } of this) { // eslint-disable-line no-unused-vars
    const allBoxProducts = box.includedProducts.concat(box.addOnProducts);
    yield (
      <tr key={index}>
        <td
          data-title="Delivered"
          class="w-10-l pv3 pr3 bb b--black-20 black-70 v-top"
        >
          <span class="">{new Date(box.delivered).toLocaleDateString()}</span>
        </td>
        <td data-title="SKU" class="w-20-l pv3 pr3 bb b--black-20 v-top">
          <strong>{box.shopify_sku}</strong>
        </td>
        <td
          data-title="Included"
          class="w-30-l pv3 pr3 bb b--black-20 black-50 v-top"
        >
          <div
            class="dt dt--fixed hover-dark-green pointer"
            onclick={toggleCollapse}
          >
            <span class="dtc">
              {box.includedProducts.length} included products
            </span>
            <span class="v-mid">
              {collapsed ? <CaretDownIcon /> : <CaretUpIcon />}
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
        <td
          data-title="Add Ons"
          class="w-30-l pv3 pr3 bb b--black-20 black-50 v-top"
        >
          <div
            class="dt dt--fixed hover-dark-green pointer"
            onclick={toggleCollapse}
          >
            <span class="dtc">{box.addOnProducts.length} add on products</span>
            <span class="v-mid">
              {collapsed ? <CaretDownIcon /> : <CaretUpIcon />}
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
        <td
          data-title="Price"
          class="w-10-l pv3 pr3 bb b--black-20 rh-copy black-70 v-top"
        >
          ${parseFloat(box.shopify_price / 100).toFixed(2)}
        </td>
        <td
          data-title="Actions"
          class="w-10-l pt3 bb b--black-20 rh-copy black-70 v-top"
        >
          {box.active === true ? (
            <IconButton color="dark-green" title="Toggle box off" name="toggle-off">
              <ToggleOnIcon />
            </IconButton>
          ) : (
            <IconButton color="dark-red" title="Toggle box on" name="toggle-on">
              <ToggleOffIcon />
            </IconButton>
          )}
          <RemoveBoxModal box={box} />
        </td>
      </tr>
    );
  }
}

export default Box;
