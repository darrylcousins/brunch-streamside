/** @jsx createElement */
import {createElement, Fragment} from '@bikeshaving/crank/cjs';

import BarLoader from '../lib/bar-loader';
import Error from '../lib/error';
import { PostFetch } from '../lib/fetch';
import { CloseIcon } from '../lib/icon';
import Button from '../lib/button';

function FormModalWrapper(Component, options) {

  return function *(props) {

    let {
      id,
      title,
      src,
      ShowLink,
      color,
      saveMsg,
      successMsg,
      index
    } = options;
    let name = title.toLowerCase().replace(/ /g, '-');

    let visible = false;
    let loading = false;
    let success = false;
    let saving = false;
    let fetchError = null;

    const closeModal = () => {
      visible = false;
      this.refresh();
    };

    const showModal = () => {
      visible = !visible;
      this.refresh();
    };

    const saveData = (json) => {
      loading = true;
      saving = true;
      this.refresh();

      let hasFile = false;
      let data;
      let headers = { 'Content-Type': 'application/json' };

      // check to find if we have a file upload
      for (const [key, value] of Object.entries(json)) {
        if (typeof value.name === 'string') {
          hasFile = true;
          break;
        }
      }
      // we have a file so need to use FormData and not json encode data
      // see PostFetch
      if (hasFile) {
        data = new FormData();
        for (const [key, value] of Object.entries(json)) {
          data.set(key, value);
        }
        headers = false;
      } else {
        // no file - use json encoding
        data = json;
      }

      console.log(headers, data);

      PostFetch({ src, data, headers })
        .then(result => {
          const { error, json } = result;
          if (error !== null) {
            fetchError = error;
            console.log('Fetch:', fetchError);
            loading = false;
            saving = false;
            this.refresh();
          } else {
            console.log(JSON.stringify(json));
            loading = false;
            saving = false;
            success = true;
            this.refresh();
            setTimeout(function(){ window.location.reload(); }, 2000);
          };
        })
        .catch(err => {
          console.log('ERROR:', err);
          fetchError = err;
          loading = false;
          this.refresh();
        });
    };

    this.addEventListener("click", async (ev) => {
      const name = ev.target.tagName.toUpperCase();
      if (name === "SVG" || name === 'PATH') {
        showModal();
      };
    });

    const getData = () => {
      const form = document.getElementById(id);
      // get them all and use data-type to sort for type
      let data = {};
      Array.from(form.elements).forEach(el => {
        if (el.tagName !== 'FIELDSET') {
          let value;
          if (el.type === 'checkbox') {
            value = el.checked;
          } else if (el.type === 'file') {
            value = el.files[0];
          } else {
            value = el.value;
          }
          if (el.getAttribute('datatype') === 'integer') {
            value = parseInt(value);
          }
          if (el.getAttribute('datatype') === 'array') {
            value = value.split(',').filter(el => el !== '');
          }
          data[el.id] = value;
        }
      });
      return data;
    };

    // these next two methods could be moved to FormModalWrapper
    // but for the fact of access to 'getData'
    // listen for affirmation of form validates
    this.addEventListener(`${id}.valid`, ev => {
      console.log('Got return event after validation', ev.detail.valid); // should be true
      if (ev.detail.valid === true) {
        // valid is true
        // call ModalWrapper method 'saveData'
        saveData(getData());
      }
    });

    const doSave = () => {
      const form = document.getElementById(id);
      // fire event listener for Form element - which fires the above
      try {
        form.dispatchEvent(
          new CustomEvent(`${id}.validate`, {
            bubbles: true
          })
        );
      } catch(err) {
        console.log(err);
      }
    };

    while (true) (
      yield ( 
        <Fragment>
          <ShowLink name={name} color={color} title={title} showModal={showModal} />
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
                  title="Close modal">
                  <CloseIcon />
                  <span class="dn">Close modal</span>
                </a>
                <div class="tc center">
                  <h2 class="fw4 fg-streamside-maroon">{ title }.</h2>
                </div>
                { fetchError && <Error msg={ fetchError } /> }
                { saving && (
                  <div class="mv2 pt2 pl2 navy br3 ba b--navy bg-washed-blue">
                    <p class="tc">{ saveMsg }</p>
                  </div>
                )}
                { success && (
                  <div class="mv2 pt2 pl2 br3 dark-green ba b--dark-green bg-washed-green">
                    <p class="tc">{ successMsg }</p>
                  </div>
                )}
                { loading && <BarLoader /> }
                { !loading && !success && !fetchError && (
                  <Component
                    {...props}
                    title={ title }
                    formId={ id }
                    doSave={ doSave }
                    closeModal={ closeModal }
                  />
                )}
              </div>
            </div>
            )}
          </Fragment>
      )
    )
  }

};

module.exports = FormModalWrapper;
