/** @jsx createElement */
import { createElement } from "@bikeshaving/crank/cjs";

export default function Box({ box, index }) {
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
