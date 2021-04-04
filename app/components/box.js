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

  const deliveryDate = new Date(box.delivered);

  let collapsed = true;

  const Products = ({products}) => (
    products.map((el) => (
      <span class="db">{el.shopify_title}</span>
    ))
  );

  const toggleCollapse = () => {
    collapsed = !collapsed;
    this.refresh();
  };

  this.addEventListener("click", toggleCollapse);

  const CollapsibleProducts = CollapseWrapper(Products);

  for (const props of this) {
    yield (
      <tr key={index}>
        <td class="pv3 pr3 bb b--black-20 black-70 v-top">
          {deliveryDate.toLocaleDateString()}
        </td>
        <td class="pv3 pr3 bb b--black-20 v-top">
          <strong>{box.shopify_sku}</strong>
        </td>
        <td class="pv3 pr3 bb b--black-20 black-50 v-top">
          <CollapsibleProducts 
            products={box.includedProducts}
            collapsed={collapsed}
            id={`included-${box.shopify_product_id}`}
          />
        </td>
        <td class="pv3 pr3 bb b--black-20 black-50 v-top">
          <CollapsibleProducts 
            products={box.addOnProducts}
            collapsed={collapsed}
            id={`addons-${box.shopify_product_id}`}
          />
        </td>
        <td class="pv3 pr3 bb b--black-20 rh-copy black-70 v-top">
          ${parseFloat(box.shopify_price / 100).toFixed(2)}
        </td>
      </tr>
    );
  };
}

export default Box;
