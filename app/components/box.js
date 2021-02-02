/** @jsx createElement */
/**
 * Display a table row of box details
 *
 * @module app/components/box
 * @exports Box
 */
import { createElement } from "@bikeshaving/crank/cjs";

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
function Box({ box, index }) {
  const deliveryDate = new Date(box.delivered);
  return (
    <tr key={index}>
      <td class="pv3 pr3 bb b--black-20 black-70 v-top">
        {deliveryDate.toLocaleDateString()}
      </td>
      <td class="pv3 pr3 bb b--black-20 v-top">
        <strong>{box.shopify_sku}</strong>
      </td>
      <td class="pv3 pr3 bb b--black-20 black-50 v-top">
        {box.includedProducts.map((el) => (
          <span class="db">{el}</span>
        ))}
      </td>
      <td class="pv3 pr3 bb b--black-20 black-50 v-top">
        {box.addOnProducts.map((el) => (
          <span class="db">{el}</span>
        ))}
      </td>
      <td class="pv3 pr3 bb b--black-20 rh-copy black-70 v-top">
        ${parseFloat(box.shopify_price / 100).toFixed(2)}
      </td>
    </tr>
  );
}

export default Box;
