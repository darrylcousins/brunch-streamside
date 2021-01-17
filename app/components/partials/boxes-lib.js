/** @jsx createElement */
import {createElement, Fragment} from '@bikeshaving/crank/cjs';
import { sortObjectByKey } from './order-lib';

const Box = ({box, index}) => {
  const deliveryDate = new Date(box.delivered);
  return (
    <tr key={index}>
      <td class="pv3 pr3 bb b--black-20 black-70 v-top">
        { deliveryDate.toLocaleDateString() }
      </td>
      <td class="pv3 pr3 bb b--black-20 v-top">
        <strong>{ box.shopify_sku }</strong>
      </td>
      <td class="pv3 pr3 bb b--black-20 black-50">
        { box.includedProducts.map(el => (
          <span class="db">{ el }</span>
        ))}
      </td>
      <td class="pv3 pr3 bb b--black-20 black-50">
        { box.addOnProducts.map(el => (
          <span class="db">{ el }</span>
        ))}
      </td>
      <td class="pv3 pr3 bb b--black-20 rh-copy black-70 v-top">${ parseFloat(box.shopify_price/100).toFixed(2) }</td>
    </tr>
  );
};

function Boxes({boxes}) {

  this.addEventListener("click", async (ev) => {
    const name = ev.target.tagName;
    if (name === 'LABEL' || name === 'H2' ) {
      const id = ev.target.id;
      const color = 'dark-green';
      const opacity = 'o-40';
      if (id) {
        document.querySelectorAll("h2[name='tabs']").forEach(el => {
          if (el.id !== id) {
            console.log(el.id, 'not clicked');
            el.classList.remove(color);
            el.classList.add(opacity);
          } else {
            console.log(id, 'clicked!');
            el.classList.add(color);
            el.classList.remove(opacity);
          }
        });
      };
    };
  });
  return (
    <div class="overflow-auto">
      { Object.keys(boxes).length > 0 && (
        <div class="tabs center">
          <div class="tabs__menu dt dt--fixed mb2 bb b--black-20">
            { Object.keys(boxes).map((key, index) => (
              <label 
                for={ key.replace(' ', '-') }
                class="tabs__menu-item dtc tc bg-white pt1 pb2 bg-animate hover-bg-near-white pointer">
                <h2
                  class={ `mv0 f6 f5-ns lh-title-ns ttu tracked ${ (index !== 0) && 'o-40' } ${ (index === 0) && 'dark-green' }` }
                  id={ key.replace(' ', '-') + '-key' }
                  name="tabs">
                  { key }
                </h2>
              </label>
            ))}
          </div>
          <div class="tabs__content">
            { Object.keys(boxes).map((key, index) => (
              <div>
                <input type="radio" class="dn" name="sections"
                  id={ key.replace(' ', '-') } checked={ (index === 0) } />
                <div class="tabs__content__info">
                  <table class="f6 w-100 center" cellspacing="0">
                    <thead>
                      <tr>
                        <th class="fw6 bb b--black-20 tl pb3 pr3 bg-white">Delivery Date</th>
                        <th class="fw6 bb b--black-20 tl pb3 pr3 bg-white">Title</th>
                        <th class="fw6 bb b--black-20 tl pb3 pr3 bg-white">Including</th>
                        <th class="fw6 bb b--black-20 tl pb3 pr3 bg-white">Extras</th>
                        <th class="fw6 bb b--black-20 tl pb3 pr3 bg-white">Price</th>
                      </tr>
                    </thead>
                    <tbody class="lh-copy">
                      { 
                        sortObjectByKey(boxes[key], 'shopify_sku').map((box, index) => (
                          <Box key={index} box={box} />
                        ))
                      }
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    }
    </div>
  )
};

module.exports = {
  Box,
  Boxes
};

