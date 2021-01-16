/** @jsx createElement */
import {createElement, Fragment} from '@bikeshaving/crank/cjs';
import {renderer} from '@bikeshaving/crank/cjs/dom';

import AddOrderModal from './order-add';
import RemoveModal from './order-remove';
import {
  HelpSection,
  Order,
  OrderDetail,
  PickingTable,
  TableHeader,
  TableBody,
  sortObjectByKeys
} from './order-lib';
import BarLoader from '../lib/bar-loader';
import Error from '../lib/error';
import { Fetch } from '../lib/fetch';
import {
  DownloadIcon,
  HelpIcon,
  CloseIcon,
  EditIcon
} from '../lib/icon';
import Button from '../lib/button';


function *CurrentOrders() {
  let fetchOrders = Object();
  let fetchError = null;
  let fetchHeaders = null;
  let fetchPickingList = Object();
  let loading = true;

  Fetch(`/api/current-orders`)
    .then(result => {
      const { error, json } = result;
      if (error !== null) {
        fetchError = error;
        console.log('fetch error:', fetchError);
        loading = false;
        this.refresh();
      } else {
        const { headers, orders, pickingList } = json;
        fetchHeaders = headers;
        fetchOrders = sortObjectByKeys(orders);
        fetchPickingList = pickingList;
        loading = false;
        this.refresh();
      };
    })
    .catch(err => {
      fetchError = err;
      loading = false;
      this.refresh();
    });

  this.addEventListener("click", async (ev) => {
    const name = ev.target.tagName;
    if (name === 'LABEL' || name === 'H2' ) {
      const id = ev.target.id;
      if (id) {
        const color = 'dark-green';
        const bgcolor = 'bg-near-white';
        const opacity = 'o-40';
        console.log(id);
        document.querySelectorAll("label[name='tabs']>a").forEach(el => {
          //el.classList.add('dib');
          if (el.name === id) {
            el.classList.remove('dn');
            el.classList.add('dib');
          } else {
            el.classList.remove('dib');
            el.classList.add('dn');
          };
        });
        document.querySelectorAll("label[name='tabs']").forEach(el => {
          el.classList.remove(color);
          el.classList.add(opacity);
        });
        const label = document.querySelector(`label#${id}`);
        label.classList.add(color);
        label.classList.remove(opacity);
      };
    };
  });

  while (true) {
    yield (
      <div class="f6 w-100 pb2 center">
        <div class="dt dt--fixed">
          <div class="dtc">
            <h2 class="pt0 f5 f4-ns lh-title-ns ma0 fg-streamside-maroon">Current Orders</h2>
            <p class="lh-copy">
              { loading ? <span><i class="b">Hold tight.</i> Collecting and collating </span> : 'Displaying ' }
              all <code class="b">unfulfilled</code> orders from
              <i class="b"> streamsideorganics.myshopify.com</i>.
              { loading && 'This will take a moment.' }
            </p>
          </div>
          { !loading && (
            <div class="dtc relative">
              <HelpSection>
                <p class="lh-copy o-70">
                  &#x26AA; Click on the date header to display orders for that delivery date.<br />
                  &#x26AA; The <code>excel</code> symbol is a link to download the individual
                  <code> xlsx</code> files for each delivery date.<br />
                  <span class="pl3">(Orders which haven't recorded a delivery date will also be included.)</span><br />
                  &#x26AA; Packing lists for <strong>extra</strong> items are also available for download below.
                </p>
              </HelpSection>
            </div>
          )}
        </div>
        <div class="overflow-auto">
          { fetchError && <Error msg={fetchError} /> }
          { Object.keys(fetchOrders).length > 0 && (
            <div class="tabs center bt">
              <div class="tabs__menu dt dt--fixed mb2 bb b--black-40">
                { Object.keys(fetchOrders).map((key, index) => (
                  <label 
                    name="tabs"
                    for={ key.replace(/ /g, '-') }
                    id={ key.replace(/ /g, '-') + '-key' }
                    class={ 
                      `tabs__menu-item dtc tc pt1 pb2 pointer dib fg-streamside-maroon ${ (index !== 0) ? 'o-40 hover-bg-light-gray' : 'fg-streamside-blue' }`
                    }>
                    <h2
                      class="mv0 pa1 fw5 f6 f5-ns ttu tracked"
                      id={ key.replace(/ /g, '-') + '-key' }
                      name="tabs">
                      { key }&nbsp;
                      ({ fetchOrders[key].length })
                    </h2>
                        <AddOrderModal delivered={ key } index={ index } />
                        <RemoveModal delivered={ key } index={ index } />
                      { ( new Date(key).toString() !== 'Invalid Date' ) && 
                        <a
                          name={ key.replace(/ /g, '-') + '-key' }
                          class={ `no-underline green ${ (index !== 0) ? 'dn' : 'dib'}` }
                          href={ `/api/orders-download/${ new Date(key).getTime() }` }
                          title="Download as xlsx">
                          <DownloadIcon />
                          <span class="dn">Download</span>
                        </a>
                      }
                  </label>
                ))}
              </div>
              <div class="tabs__content">
                { Object.keys(fetchOrders).map((key, index) => (
                  <div>
                    <input type="radio" class="dn" name="sections"
                      id={ key.replace(/ /g, '-') } checked={ (index === 0) } />
                    <div class="tabs__content__info">
                      <table class="f6 w-100 center" cellspacing="0">
                        { fetchHeaders && <TableHeader crank-key={ `${ key }-th` } headers={fetchHeaders} /> }
                        { fetchOrders[key].length > 0 && <TableBody crank-key={ `${ key }-tb` } orders={fetchOrders[key]} /> }
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          { Object.keys(fetchPickingList).length > 0 && <PickingTable items={fetchPickingList} /> }
        </div>
        { loading && <BarLoader /> }
      </div>
    );
  };
};

module.exports = CurrentOrders;
