/** @jsx createElement */
import {createElement, Fragment} from '@bikeshaving/crank/cjs';
import {renderer} from '@bikeshaving/crank/cjs/dom';

import Loader from '../lib/loader';
import BarLoader from '../lib/bar-loader';
import Error from '../lib/error';
import { Fetch, PostFetch } from '../lib/fetch';
import {
  DownloadIcon,
  DeleteIcon,
  AddIcon,
  HelpIcon,
  CloseIcon,
  EditIcon
} from '../lib/icon';
import Button from './button';

const sortObjectByKeys = (o) => Object.keys(o).sort().reduce((r, k) => (r[k] = o[k], r), {});

const OrderDetail = ({order}) => {
  return (
    <div class="dt-ns dt--fixed-ns">
      <div class="dtc-ns pv4">
        <article class="bg-white center">
          <div class="ph3">
            <h1 class="f4 f4-ns fw6 mid-gray">{ order.sku }</h1>
            <h2 class="f5 gray fw2 ttu">{ order.delivered }</h2>
            { order.order_number && (
              <h3 class="f6 gray fw2 ttu tracked">Order # { order.order_number }</h3>
            )}
          </div>
          <div class="ph3">
            <span class="b gray db pv1">{ order.name }</span>
            <span class="gray db pv1">{ order.address1 }</span>
            <span class="gray db pv1">{ order.address2 }</span>
            <span class="gray db pv1">{ order.city } { order.zip }</span>
            <span class="gray db pv1">{ order.phone }</span>
          </div>
          <h3 class="f6 gray fw2 ttu tracked">{ order.source }</h3>
        </article>
      </div>
      <div class="dtc-ns pv4">
       <h1 class="f4 f4-ns fw6 mid-gray tracked">Includes</h1>
        <div>
          { (order.including.length === 0) ? <span class="gray db pv1">None</span> : (
            order.including.map(el => <span class="gray db pv1">{ el }</span>)
          ) }
        </div>
      </div>
      <div class="dtc-ns pv4">
       <h1 class="f4 f4-ns fw6 mid-gray tracked">Extras</h1>
        <div>
          { (order.addons.length === 0) ? <span class="gray db pv1">None</span> : (
            order.addons.map(el => <span class="gray db pv1">{ el }</span>)
          ) }
        </div>
      </div>
      <div class="dtc-ns pv4">
       <h1 class="f4 f4-ns fw6 mid-gray tracked">Excluding</h1>
        <div>
          { (order.removed.length === 0) ? <span class="gray db pv1">None</span> : (
            order.removed.map(el => <span class="gray db pv1">{ el }</span>)
          ) }
        </div>
      </div>
    </div>
  );
};

function *HelpSection({ children}) {
  let visible = false;

  const remove = () => {
    visible = false;
    this.refresh();
  };
  this.addEventListener("click", async (ev) => {
    const name = ev.target.tagName.toUpperCase();
    if (name === "SVG" || name === 'PATH') {
      visible = !visible;
      this.refresh();
    } else {
      remove();
    };
  });

  while (true) {
    yield (
      <Fragment>
        { !visible ? (
        <a
          class="no-underline mid-gray dim o-70 absolute top-1 right-1"
          name="open"
          href="#"
          title="Get further info">
          <HelpIcon />
          <span class="dn">Get info</span>
        </a>
        ) : (
          <Fragment>
            <a
              class="no-underline mid-gray dim o-70 absolute top-1 right-1"
              name="close"
              href="#"
              title="Close info">
              <CloseIcon />
              <span class="dn">Close info</span>
            </a>
            { children }
          </Fragment>
        )}
      </Fragment>
    )
  };
};

function *OrderModal({ row }) {
  let visible = false;

  const remove = () => {
    visible = false;
    this.refresh();
  };
  this.addEventListener("click", async (ev) => {
    if (ev.target.tagName === "BUTTON") {
      visible = !visible;
      this.refresh();
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
            <OrderDetail order={ row } />
          </div>
        </div>
      </Fragment>
    )
  };
};

function *AddModal({ delivered, index }) {
  let visible = false;

  const remove = () => {
    visible = false;
    this.refresh();
  };
  this.addEventListener("click", async (ev) => {
    const name = ev.target.tagName.toUpperCase();
    if (name === "SVG" || name === 'PATH') {
      visible = !visible;
      this.refresh();
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
        <a
          name={ delivered.replace(/ /g, '-') + '-key' }
          class={ `no-underline dark-blue dim ${ (index !== 0) ? 'dn' : 'dib'}` }
          href="#"
          title="Add Order">
          <AddIcon />
        </a>
        <div class={ `${ visible ? `db absolute left-0 } w-100 h-100 z-1` : 'dn' } bg-black-90 pa4` }
             style={ visible ? `top: ${ Math.round(window.scrollY).toString() }px;` : '' }>
          <div class="bg-white pa4">
            <span>Adding an order for { delivered }</span>
            <a
              class="no-underline navy dim"
              href={ `/api/orders-delete/${
                new Date(delivered).toString() !== 'Invalid Date' ? new Date(delivered).getTime() : 'empty-date'
              }` }
              title="Add Orders">
              <AddIcon />
              <span class="dn">Add</span>
            </a>
          </div>
        </div>
      </Fragment>
    )
  };
};

function *DeleteModal({ delivered, index }) {
  let visible = false;
  let loading = true;
  let fetchError = null;
  let fetchSources =[];
  let selected = [];
  let success = 0;
  let active = false; // try to keep button visible on refresh
  const key = delivered.replace(/ /g, '-').toLowerCase();

  const closeModal = () => {
    visible = false;
    active = true;
    this.refresh();
  };

  const loadSources = () => {
    active = true;
    PostFetch({ src: `/api/order-sources`, data: { delivered } })
      .then(result => {
        const { error, json } = result;
        if (error !== null) {
          fetchError = error;
          console.log('fetch error:', fetchError);
          loading = false;
          this.refresh();
        } else {
          fetchSources = JSON.parse(json);
          selected = fetchSources.map(s => s.toLowerCase().replace(/ /g, '-'));
          loading = false;
          this.refresh();
        };
      })
      .catch(err => {
        fetchError = err;
        loading = false;
        this.refresh();
      });
  };

  const doDelete = () => {
    loading = true;
    this.refresh();
    const sources = fetchSources.filter(el => selected.includes(el.toLowerCase().replace(/ /g, '-')));
    const data = { sources, delivered };
    console.log(JSON.stringify(data, null, 2));
    PostFetch({ src: `/api/delete-orders`, data })
      .then(result => {
        const { error, json } = result;
        if (error !== null) {
          fetchError = error;
          console.log('fetch error:', fetchError);
          loading = false;
          this.refresh();
        } else {
          console.log(JSON.stringify(json, null, 2));
          loading = false;
          success = parseInt(JSON.parse(json).count);
          setTimeout(function(){ window.location.reload(); }, 2000);
          this.refresh();
        };
      })
      .catch(err => {
        fetchError = err;
        loading = false;
        this.refresh();
      });
  };

  const updateSelected = (id, remove) => {
    if (id === '') return;
    const idx = selected.indexOf(id);
    if (idx === -1 && !remove) {
      selected.push(id);
    } else if (idx > -1 && remove) {
      selected.splice(idx, 1);
    };
  };

  this.addEventListener("click", async (ev) => {
    const name = ev.target.tagName.toUpperCase();
    if (name === "SVG" || name === 'PATH') {
      visible = !visible;
      this.refresh();
      loadSources();
    } else if (name === "LABEL" || name === 'INPUT') {
      if (ev.target.value && ev.target.value === 'allsources') {
        let remove = !ev.target.checked;
        document.querySelectorAll("input[name='sources']").forEach(el => {
          updateSelected(el.id, !ev.target.checked);
        });
      } else if (ev.target.value) {
        updateSelected(ev.target.id, !ev.target.checked);
      };
      this.refresh();
    };
  });

  while (true) {
    yield (
      <Fragment>
        <a
          name={ delivered.replace(/ /g, '-') + '-key' }
          class={ `no-underline dark-red dim ${ (index !== 0 && !active) ? 'dn' : 'dib'}` }
          href="#"
          title="Delete Orders">
          <DeleteIcon />
        </a>
        { visible && (
        <div class="db absolute left-0 w-100 h-100 z-1 bg-black-90 pa4"
             style={ `top: ${ Math.round(window.scrollY).toString() }px; cursor: default` }>
          <div class="bg-white pa4 br3">
            <a
              class="no-underline mid-gray dim o-70 absolute top-1 right-1"
              name="close"
              onclick={ closeModal }
              href="#"
              style="margin-right: 30px; margin-top: 30px;"
              title="Close info">
              <CloseIcon />
              <span class="dn">Close info</span>
            </a>
            { fetchError && <Error msg={fetchError} /> }
            <h2 class="fw4">Removing orders from '{ delivered }'.</h2>
            <p class="lh-copy near-black tl">
              Use the checkboxes to filter orders by sources. Currently individual orders cannot be removed.
              Removing orders here makes <b>no</b> changes to the orders on Shopify nor to the original imported files
              from BuckyBox or CSA.
            </p>
            { loading && <BarLoader /> }
            { fetchSources.length > 0 && (
              <Fragment>
                <div class="flex items-center mb3 dark-gray" id={ key }>
                  <input 
                    class="mr2"
                    type="checkbox"
                    id="allsources"
                    value="allsources"
                    style="visibility: hidden"
                    checked={ selected.length > 0 }
                  />
                  <label for="allsources" class="lh-copy">
                    { selected.length === 0 ? 'Select all' : 'Deselect all' }
                  </label>
                </div>
                { fetchSources.map(source => (
                  <div class="flex items-center mb2 dark-gray">
                    <input
                      class="mr2" type="checkbox"
                      id={ source.toLowerCase() }
                      value={ source.toLowerCase() }
                      name="sources"
                      checked={ selected.includes(source.toLowerCase()) }
                    />
                    <label for={ source.toLowerCase() } class="lh-copy">{ source }</label>
                  </div>
                ))}
                { (success > 0) ? (
                  <div class="lh-copy dark-gray pa3 br3 ba b--dark-gray bg-washed-green">
                    Successfully deleted { success } orders, reloading page.
                  </div>
                ) : (
                  <Button
                    onclick={ doDelete }
                    style={ selected.length === 0 ? 'opacity: 0.3' : '' }
                    disabled={ selected.length === 0 }>
                  Do delete
                </Button>
                )}
              </Fragment>
            )}
          </div>
        </div>
        )}
      </Fragment>
    )
  };
};

const Order = ({order, index}) => {
  return (
    <tr crank-key={order._id} class="striped--near-white">
      <td class="pv1 ph1 bb b--black-20 v-top">
        { order.sku }
      </td>
      <td class="pv1 ph1 bb b--black-20 v-top">
        { order.delivered }
      </td>
      <td class="pv1 ph1 bb b--black-20 v-top">
        { order.order_number }
      </td>
      <td class="pv1 ph1 bb b--black-20 v-top">
        <span class="db">{ order.name }</span>
        <span class="db">{ order.phone }</span>
        <span class="db">{ order.contact_email }</span>
      </td>
      <td class="pv1 ph1 bb b--black-20 v-top">
        <span class="db">{ order.address1 }</span>
        <span class="db">{ order.address2 }</span>
        <span class="db">{ order.city }</span>
        <span class="db">{ order.zip }</span>
      </td>
      <td class="pv1 ph1 bb b--black-20 v-top">
        { order.source }
      </td>
      <td class="pv1 ph1 bb b--black-20 v-top">
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
  // order by box title
  orders.sort((a, b) => {
    var nameA = a['sku'].toUpperCase(); // ignore upper and lowercase
    var nameB = b['sku'].toUpperCase(); // ignore upper and lowercase
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
      <h2 class="pt2 pt4-ns f5 f4-ns lh-title-ns fg-streamside-maroon">
        Picking List{ Object.keys(items).length > 1 && <span>s</span> }
      </h2>
      <table cellspacing="0">
        <tbody class="lh-copy pt3">
          <tr>
            { 
              Object.keys(items).map((name, index) => (
                <th class="normal f6 f5-ns bb b--black-20 tl pb1 pr3 bg-white fg-streamside-maroon">
                  <div class="dib mr4-ns">
                    <a
                      class="no-underline dark-green dim"
                      href={ `/api/picking-list/${ new Date(name).getTime() }` }
                      title="Download as xlsx">
                      <DownloadIcon />
                      <span class="dn">Download</span>
                    </a>
                    <a
                      class="no-underline dark-blue dim dn"
                      href={ `/api/edit-picking-list/${ new Date(name).getTime() }` }
                      title="Edit Picking List">
                      <EditIcon />
                      <span class="dn">Edit</span>
                    </a>
                  </div>
                  { name }
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
      <div class="f6 w-100 pb2 center" cellspacing="0">
        <div class="dt dt--fixed">
          <div class="dtc">
            <h2 class="pt0 f5 f4-ns lh-title-ns ma0 fg-streamside-maroon">Current Orders</h2>
            <p class="lh-copy">
              { loading ? <span><i class="b">Hold tight.</i> Collecting and collating </span> : 'Displaying ' }
              all <code class="b">open</code> and <code class="b">unfulfilled</code> orders from
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
                        <AddModal delivered={ key } index={ index } />
                        <DeleteModal delivered={ key } index={ index } />
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

