/** @jsx createElement */
import {createElement, Fragment} from '@bikeshaving/crank/cjs';
import {renderer} from '@bikeshaving/crank/cjs/dom';

import EditOrderModal from './order-edit';
import RemoveOrderModal from './order-remove';
import {
  DownloadIcon,
  HelpIcon,
  CloseIcon,
  EditIcon
} from '../lib/icon';
import Button from '../lib/button';

const sortObjectByKeys = (o) => Object.keys(o).sort().reduce((r, k) => (r[k] = o[k], r), {});

const sortObjectByKey = (o, key) => {
  o.sort((a, b) => {
    var nameA = a[key].toUpperCase(); // ignore upper and lowercase
    var nameB = b[key].toUpperCase(); // ignore upper and lowercase
    if (nameA < nameB) return -1;
    if (nameA > nameB) return 1;
    return 0;
  });
  return o;
};

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
            <span class="gray db pv1">{ order.contact_email }</span>
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

function *OrderModal({ row }) {
  let visible = false;

  const remove = () => {
    visible = false;
    this.refresh();
  };

  const closeModal = () => {
    visible = false;
    this.refresh();
  };

  this.addEventListener("click", async (ev) => {
    if (ev.target.tagName === "BUTTON") {
      visible = !visible;
      this.refresh();
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
        { visible && (
          <div class="db absolute left-0 w-100 h-100 z-1 bg-black-90 pa4"
               style={ `top: ${ Math.round(window.scrollY).toString() }px;` }>
            <div class="bg-white pa4 br3">
              <a
                class="no-underline mid-gray dim o-70 absolute top-1 right-1"
                name="close"
                onclick={ closeModal }
                href="#"
                style="margin-right: 30px; margin-top: 30px;"
                title="Close info">
                <CloseIcon />
                <span class="dn">Close add modal</span>
              </a>
              <OrderDetail order={ row } />
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
         <EditOrderModal order={ order } delivered={ order.delivered } />
         <RemoveOrderModal order={ order } />
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

module.exports = {
  HelpSection,
  Order,
  OrderDetail,
  PickingTable,
  TableHeader,
  TableBody,
  sortObjectByKey,
  sortObjectByKeys
};
