/** @jsx createElement */
import {createElement, Fragment} from '@bikeshaving/crank/cjs';
import {renderer} from '@bikeshaving/crank/cjs/dom';

import Loader from '../lib/loader';
import BarLoader from '../lib/bar-loader';
import Error from '../lib/error';
import Fetch from '../lib/fetch';
import Icon from '../lib/icon';
import Button from './button';

const sortObjectByKeys = (o) => Object.keys(o).sort().reduce((r, k) => (r[k] = o[k], r), {});

const OrderDetail = ({order}) => {
  const [logo, box, delivery, name, run, firstName, lastName, address, suburb, city, postcode, phone, excluding, extras, note] = order;
  const extrasList = extras.split('\n').filter(el => el !== '');
  const excludingList = excluding.split('\n').filter(el => el !== '');
  return (
    <div class="dt-ns dt--fixed-ns">
      <div class="dtc-ns pv4">
        <article class="bg-white center">
          <div class="ph3">
           <h1 class="f4 f4-ns fw6 mid-gray">{ box }</h1>
           <h2 class="f5 gray fw2 ttu tracked">{ delivery }</h2>
           <h3 class="f6 gray fw2 ttu tracked">Order # { name.slice(1) }</h3>
          </div>
          <div class="pa3">
            <span class="fw4 gray db pv1">{ firstName } { lastName }</span>
            <span class="gray db pv1">{ address }</span>
            <span class="gray db pv1">{ suburb }</span>
            <span class="gray db pv1">{ city } { postcode }</span>
            <span class="gray db pv1">{ phone }</span>
          </div>
        </article>
      </div>
      <div class="dtc-ns pv4">
       <h1 class="f4 f4-ns fw6 mid-gray tracked">Extras</h1>
        <div class="pa3">
          { (extrasList.length === 0) ? <span class="gray db pv1">None</span> : (
            extrasList.map(el => <span class="gray db pv1">{ el }</span>)
          ) }
        </div>
      </div>
      <div class="dtc-ns pv4">
       <h1 class="f4 f4-ns fw6 mid-gray tracked">Excluding</h1>
        <div class="pa3">
          { (excludingList.length === 0) ? <span class="gray db pv1">None</span> : (
            excludingList.map(el => <span class="gray db pv1">{ el }</span>)
          ) }
        </div>
      </div>
    </div>
  );
};

function *OrderModal({ row }) {
  let visible = false;
  let loading = true;
  let id = row[row.length - 1];
  let parts = id.split('/');
  let gid = parts[parts.length - 1];
  let fetchOrder = null;
  let fetchError = null;

  const remove = () => {
    visible = false;
    loading = true;
    fetchOrder = null;
    fetchError = null;
    this.refresh();
  };

  this.addEventListener("click", async (ev) => {
    if (ev.target.tagName === "BUTTON") {
      visible = !visible;
      this.refresh();
      Fetch(`/api/order/${gid}`)
        .then(result => {
          const { error, json } = result;
          if (error !== null) {
            fetchError = error;
            loading = false;
            this.refresh();
          } else {
            const { order } = json;
            fetchOrder = order;
            loading = false;
            this.refresh();
          };
        })
        .catch(err => {
          fetchError = error;
          loading = false;
          this.refresh();
        });
    } else {
      remove();
    };
  });
  this.addEventListener("keyup", async (ev) => {
    if (ev.key === 'Escape') {
      remove();
    }
  });
  while (true) {
    yield (
      <Fragment>
        <Button>
          Show details
        </Button>
        <div class={ `${ visible ? `db absolute left-0 } w-100 h-100 z-1` : 'dn' } bg-black-90 pa4` }
             style={ visible ? `top: ${ Math.round(window.scrollY).toString() }px;` : '' }>
          <div class="bg-white pa4 br2">
            { fetchOrder && <OrderDetail order={ fetchOrder } /> }
            { loading && <BarLoader /> }
            { fetchError && <Error msg={fetchError} /> }
          </div>
        </div>
      </Fragment>
    )
  };
};

const Order = ({order, index}) => {
  return (
    <tr crank-key={index} class="striped--near-white">
      { 
        order.filter(item => !item.startsWith('gid')).map((item, index) => (
          <td class="pv1 ph1 bb b--black-20">
            { (index !== 1) && item }
            { ((index === 1) && item !== '') && item }
            { ((index === 1) && item === '') && 'No date recorded' }
          </td>
        ))
      }
      <td class="pv1 ph1 bb b--black-20">
        <OrderModal crank-key={index} row={ order }></OrderModal>
      </td>
    </tr>
  );
};

const TableHeader = ({headers, index}) => {
  return (
    <thead>
      <tr crank-key={index}>
        { 
          headers.map((item, index) => (
            <th class="fw6 bb b--black-20 tl pb3 ph1 bg-white">
              { item }
            </th>
          ))
        }
        <th class="fw6 bb b--black-20 tl pb3 ph1 bg-white">
        </th>
      </tr>
    </thead>
  );
};

const TableBody = ({orders}) => {
  // order by box title??
  orders.sort((a, b) => {
    var nameA = a[0].toUpperCase(); // ignore upper and lowercase
    var nameB = b[0].toUpperCase(); // ignore upper and lowercase
    if (nameA < nameB) return -1;
    if (nameA > nameB) return 1;
    return 0;
  });
  return (
    <tbody class="lh-copy">
      { 
        orders.map((order, index) => (
          <Order index={index} order={order} />
        ))
      }
    </tbody>
  )
};

const PickingTable = ({items}) => {
  return (
    <Fragment>
      <h2 class="pt2 pt4-ns f5 f4-ns lh-title-ns">
        Picking List{ Object.keys(items).length > 1 && <span>s</span> }
      </h2>
      <table cellspacing="0">
        <tbody class="lh-copy pt3">
          <tr>
            { 
              Object.keys(items).map((name, index) => (
                <th class="f6 f5-ns bb b--black-20 tl pb1 pr3 bg-white">
                  { name }
                  <a
                    class="no-underline green inline-flex items-center tc br2 pa2"
                    href={ `/api/picking-list/${ new Date(name).getTime() }` }
                    title="Download as xlsx">
                    <Icon />
                    <span class="f6 ml3 pr2 dn">Download</span>
                  </a>
                </th>
              ))
            } 
          </tr>
          <tr>
            { 
              Object.keys(items).map((name, index) => (
                <td class="pr3 bb b--black-20 v-top">
                  <table>
                    { 
                      Object.keys(sortObjectByKeys(items[name])).map((key, index) => (
                        <tr crank-key={index}>
                          <td class="pr3">
                            { key }
                          </td>
                          <td class="pr3">
                            { items[name][key] }
                          </td>
                        </tr>
                      ))
                    }
                  </table>
                </td>
              ))
            }
          </tr>
        </tbody>
      </table>
    </Fragment>
  )
};

function *CurrentOrders() {
  let fetchJson = Array();
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
        fetchJson = orders['Thu Jan 07 2021'];
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
    if (ev.target.tagName === "H2") {
      const color = 'dark-green';
      const opacity = 'o-40';
      document.getElementsByName('tabs').forEach(el => {
        el.classList.remove(color);
        el.classList.add(opacity);
      });
      ev.target.classList.add(color);
      ev.target.classList.remove(opacity);
    };
  });

  while (true) {
    yield (
      <div class="f6 w-100 pb2 center" cellspacing="0">
        <div class="dt dt--fixed">
          <div class="dtc">
            <h2 class="pt0 f5 f4-ns lh-title-ns">Current Orders</h2>
            <p class="lh-copy">
              { loading ? <span><i class="b">Hold tight.</i> Collecting and collating </span> : 'Displaying ' }
              all <code class="b">open</code> and <code class="b">unfulfilled</code> orders from
              <i class="b"> streamsideorganics.myshopify.com</i>.
              { loading && 'This will take a moment.' }
            </p>
          </div>
          { !loading && (
            <div class="dtc">
              <p class="lh-copy o-70">
                &#x26AA; Click on the date header to display orders for that delivery date.<br />
                &#x26AA; The <code>excel</code> symbol is a link to download the individual
                <code> xlsx</code> files for each delivery date.<br />
                <span class="pl3">(Orders which haven't recorded a delivery date will also be included.)</span><br />
                &#x26AA; Packing lists for <strong>extra</strong> items are also available for download below.
              </p>
            </div>
          )}
        </div>
        <div class="overflow-auto">
          { fetchError && <Error msg={fetchError} /> }
          { Object.keys(fetchOrders).length > 0 && (
            <div class="tabs center bt">
              <div class="tabs__menu dt dt--fixed mb2 bb b--black-20">
                { Object.keys(fetchOrders).map((key, index) => (
                  <label 
                    for={ key.replace(' ', '-') }
                    class="tabs__menu-item dtc tc bg-white pt1 pb2 bg-animate hover-bg-near-white pointer">
                    <h2
                      class={ `mv0 f6 f5-ns lh-title-ns ttu tracked ${ (index !== 0) && 'o-40' } ${ (index === 0) && 'dark-green' }` }
                      name="tabs">
                      { key }
                      { ( new Date(key).toString() !== 'Invalid Date' ) &&
                        <a
                          class="no-underline green inline-flex items-center tc br2 pa2"
                          href={ `/api/orders-download/${ new Date(key).getTime() }` }
                          title="Download as xlsx">
                          <Icon />
                          <span class="f6 ml3 pr2 dn">Download</span>
                        </a>
                      }
                    </h2>
                  </label>
                ))}
              </div>
              <div class="tabs__content">
                { Object.keys(fetchOrders).map((key, index) => (
                  <div>
                    <input type="radio" class="dn" name="sections"
                      id={ key.replace(' ', '-') } checked={ (index === 0) } />
                    <div class="tabs__content__info">
                      <table class="f6 w-100 center" cellspacing="0">
                        { fetchHeaders && <TableHeader headers={fetchHeaders} /> }
                        { fetchOrders[key].length > 0 && <TableBody orders={fetchOrders[key]} /> }
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

