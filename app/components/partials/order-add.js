/** @jsx createElement */
import {createElement, Fragment} from '@bikeshaving/crank/cjs';
import {renderer} from '@bikeshaving/crank/cjs/dom';

import BarLoader from '../lib/bar-loader';
import Error from '../lib/error';
import { Fetch, PostFetch } from '../lib/fetch';
import {
  AddIcon,
  CloseIcon,
} from '../lib/icon';
import Button from '../lib/button';

function *AddModal({ delivered, index }) {
  let visible = false;
  let loading = true;
  let saving = false;
  let success = false;
  let fetchError = null;
  let fetchFields =[];
  let formElements = {};
  let formError = false;
  let active = false; // try to keep button visible on refresh
  const key = delivered.replace(/ /g, '-').toLowerCase();

  const closeModal = () => {
    visible = false;
    active = true;
    this.refresh();
  };

  const loadFields = () => {
    active = true;
    Fetch(`/api/order-fields`)
      .then(result => {
        const { error, json } = result;
        if (error !== null) {
          fetchError = error;
          console.log('fetch error:', fetchError);
          loading = false;
          this.refresh();
        } else {
          fetchFields = JSON.parse(json);
          console.log(fetchFields);
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

  const doSave = () => {
    loading = true;
    saving = true;
    this.refresh();
    const data = {
      _id: new Date().getTime(),
      addons: formElements['extras'].value
                .split(',')
                .map(el => el.trim())
                .filter(el => el !== ''),
      address1: formElements['address-line'].value,
      address2: formElements['suburb'].value,
      city: formElements['city'].value,
      contact_email: formElements['email'].value,
      delivered,
      including: [],
      first_name: formElements['first-name'].value,
      last_name: formElements['last-name'].value,
      name: `${formElements['first-name'].value} ${formElements['last-name'].value}`,
      note: formElements['delivery-note'].value,
      order_number: parseInt(formElements['order-#'].value),
      phone: formElements['telephone'].value,
      removed: formElements['excluding'].value
                .split(',')
                .map(el => el.trim())
                .filter(el => el !== ''),
      sku: formElements['box'].value,
      source: formElements['source'].value,
      subtotal_price: '',
      zip: formElements['postcode'].value,
    };
    console.log(JSON.stringify(data, null, 2));
    PostFetch({ src: `/api/save-order`, data })
      .then(result => {
        const { error, json } = result;
        if (error !== null) {
          fetchError = error;
          console.log('fetch error:', fetchError);
          loading = false;
          saving = false;
          this.refresh();
        } else {
          console.log(JSON.stringify(json, null, 2));
          loading = false;
          saving = false;
          success = true;
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

  this.addEventListener("click", async (ev) => {
    const name = ev.target.tagName.toUpperCase();
    if (name === "SVG" || name === 'PATH') {
      visible = !visible;
      loadFields();
      this.refresh();
    };
  });

  const renderInput = (label, type, index) => {
    const id = label.toLowerCase().replace(/ /g, '-');
    let valid = true;
    if (formElements.hasOwnProperty(id)) {
      valid = formElements[id].checkValidity();
    };

    // watch the index value when setting required, bit of hack that works
    return (
      <div class="fl w-100 w-50-ns tl ph2 mt3">
        <label class="db fw6 lh-copy f6" for={ id }>
          { label }
        </label>
        <input
          class={ `pa2 input-reset ba bg-transparent hover-bg-near-white w-100 br1 ${ !valid && 'invalid' }` }
          onfocus={ onFocus }
          onblur={ onBlur }
          required={ index < 11 && index !== 5 }
          type={ type } name={ id } id={ id } />
          <span class={ `small mt1 fg-streamside-orange ${ valid && 'hidden' }` }>
            Field is required
          </span>&nbsp;
      </div>
    );
  };

  const onFocus = (ev) => {
    const el = ev.target;
    el.classList.remove('invalid');
    el.nextSibling.innerHTML = '';
    el.nextSibling.classList.add('hidden');
  };

  const onBlur = (ev) => {
    const el = ev.target;
    if (!el.checkValidity()) {
      el.classList.add('invalid');
      el.nextSibling.innerHTML = el.validationMessage;
      el.nextSibling.classList.remove('hidden');
    };
  };

  const saveOrder = () => {
    const elements = document.getElementById('add-order').elements;
    let el;
    let error = false;
    for (let i=0; i<elements.length; i++) {
      el = elements[i];
      if (typeof el.value !== 'undefined') {
        if (!el.checkValidity()) {
          onBlur({ target: el });
          error = true;
        } else if (el.checkValidity()) {
          onFocus({ target: el });
        };
        formElements[el.name] = el;
      };
    };
    if (error) {
      formError = true;
      this.refresh()
      return;
    } else {
      formError = false;
      doSave();
    };
  };

  while (true) {
    console.log(formElements);
    yield (
      <Fragment>
        <a
          name={ delivered.replace(/ /g, '-') + '-key' }
          class={ `no-underline navy dim ${ (index !== 0 && !active) ? 'dn' : 'dib'}` }
          href="#"
          title="Add Order">
          <AddIcon />
        </a>
        { visible && (
          <div class="db absolute left-0 w-100 h-100 z-1 bg-black-90 pa4 overflow-visible"
               style={ `top: ${ Math.round(window.scrollY).toString() }px; cursor: default` }>
            <div class="bg-white pa4 br3">
              <a
                class="no-underline mid-gray dim o-70 absolute top-1 right-1"
                name="close"
                onclick={ closeModal }
                href="#"
                style="margin-right: 30px; margin-top: 30px;"
                title="Close add modal">
                <CloseIcon />
                <span class="dn">Close info</span>
              </a>
              <h2 class="fw4">Adding order for '{ delivered }'.</h2>
              { fetchError && <Error msg={fetchError} /> }
              { formError && <Error msg="Input failed validation please correct the errors." /> }
              { saving && (
                <div class="mv2 pt2 pl2 br3 ba b--dark-blue bg-washed-blue">
                  <p class="tc">Saving order, hang tight.</p>
                </div>
              )}
              { success && (
                <div class="lh-copy dark-gray pa3 br3 ba b--dark-gray bg-washed-green">
                  Successfully saved order, reloading page.
                </div>
              )}
              { loading && <BarLoader /> }
              { !loading && !success && !fetchError && (
                <Fragment>
                  <form id="add-order">
                    <fieldset id="add_order" class="w-80 center dark-gray tl ba b--transparent ph0 mh0">
                    <legend class="f4 fw6 ph0 mh0">Add order</legend>
                    { Object.keys(fetchFields).map((key, index) => (
                      <div>
                        { renderInput(key, fetchFields[key], index) }
                      </div>
                    ))}
                    </fieldset>
                  </form>
                  <Button
                    onclick={ saveOrder }>
                    Save order
                  </Button>
                </Fragment>
              )}
            </div>
          </div>
        )}
      </Fragment>
    )
  };
};

module.exports = AddModal;
