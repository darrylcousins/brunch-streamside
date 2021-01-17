/** @jsx createElement */
import {createElement, Fragment} from '@bikeshaving/crank/cjs';
import {renderer} from '@bikeshaving/crank/cjs/dom';

import BarLoader from '../lib/bar-loader';
import Error from '../lib/error';
import { Fetch, PostFetch } from '../lib/fetch';
import {
  DeleteIcon,
  CloseIcon,
} from '../lib/icon';
import Button from '../lib/button';

function *OrdersRemoveModal({ delivered, index }) {
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
    const headers = { 'Content-Type': 'application/json' };
    PostFetch({ src: `/api/order-sources`, data: { delivered }, headers })
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
    const headers = { 'Content-Type': 'application/json' };
    PostFetch({ src: `/api/delete-orders`, data, headers })
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

  //class={ `no-underline dark-red dim ${ (index !== 0 && !active) ? 'dn' : 'dib'}` }
  while (true) {
    yield (
      <Fragment>
        <a
          name={ delivered.replace(/ /g, '-') + '-key' }
          class={ `no-underline dark-red dim dib` }
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
              title="Close delete modal">
              <CloseIcon />
              <span class="dn">Close delete modal</span>
            </a>
            { fetchError && <Error msg={fetchError} /> }
            <h2 class="fw4">Removing orders from '{ delivered }'.</h2>
            <p class="lh-copy near-black tl">
              Use the checkboxes to filter orders by sources.  Removing orders
              here makes <b>no</b> changes to the orders on Shopify nor to the
              original imported files from BuckyBox or CSA.
            </p>
            <p class="lh-copy near-black tl">
              It would not be advised to delete any orders matching 'Shopify'
              as they are automatically inserted when created on the store.
              Later we wil have some sort of 'sync from store' functionlity.
              See <a href="todo" class="link dim">todos</a>.
            </p>
            <p class="lh-copy near-black tl bb b--gray pb2">
              As yet there is no option to remove individual orders prior to export.
              See <a href="todo" class="link dim">todos</a>.
            </p>
            { loading && <BarLoader /> }
            { fetchSources.length > 0 && (
              <Fragment>
                <div class="mt2">
                  <div class="flex items-center mb2 dark-gray" id={ key }>
                    <input 
                      class="mr2 hidden"
                      type="checkbox"
                      id="allsources"
                      value="allsources"
                      checked={ selected.length > 0 }
                    />
                    <label for="allsources" class="lh-copy">
                      { selected.length === 0 ? 'Select all' : 'Deselect all' }
                    </label>
                  </div>
                  { fetchSources.map(source => (
                    <div class="flex items-center mb1 dark-gray">
                      <input
                        class="mr2" type="checkbox"
                        id={ source.toLowerCase().replace(/ /g, '-') }
                        value={ source.toLowerCase().replace(/ /g, '-') }
                        name="sources"
                        checked={ selected.includes(source.toLowerCase().replace(/ /g, '-')) }
                      />
                      <label for={ source.toLowerCase().replace(/ /g, '-') } class="lh-copy">{ source }</label>
                    </div>
                  ))}
                </div>
                { (success > 0) ? (
                  <div class="lh-copy dark-gray pa3 br3 ba b--dark-gray bg-washed-green">
                    Successfully deleted { success } orders, reloading page.
                  </div>
                ) : (
                  <Fragment>
                    <Button
                      onclick={ doDelete }
                      style={ selected.length === 0 ? 'opacity: 0.3' : '' }
                      disabled={ selected.length === 0 }>
                      Remove Orders
                    </Button>
                    <Button
                      onclick={ closeModal }>
                      Cancel
                    </Button>
                  </Fragment>
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

module.exports = OrdersRemoveModal;
