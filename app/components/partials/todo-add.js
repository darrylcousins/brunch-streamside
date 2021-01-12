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

function *AddTodoModal() {
  let visible = false;
  let loading = false;
  let saving = false;
  let success = false;
  let fetchError = null;
  let formElements = {};
  let formError = false;

  const fields = {
    'Title': 'text',
    'Author': 'select',
    'Label': 'select',
    'Note': 'textarea',
    'Completed': 'checkbox'
  };
  const dataLists = {
    'Author': [
      'Lilly', 'Dominique', 'Darryl'
    ],
    'Label': [
      'Bug', 'Urgent', 'Enhancement', 'WontFix', 'NiceToHave'
    ],
  };

  const closeModal = () => {
    visible = false;
    this.refresh();
  };

  const doSave = () => {
    loading = true;
    saving = true;
    this.refresh();
    const now = new Date();
    const data = {
      _id: now.getTime(),
      title: formElements['title'].value,
      label: formElements['label'].value,
      note: formElements['note'].value,
      author: formElements['author'].value,
      created: now.toDateString(),
      completed: formElements['completed'].checked,
    };
    console.log(JSON.stringify(data, null, 2));
    PostFetch({ src: `/api/save-todo`, data })
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

  const showModal = () => {
    visible = !visible;
    this.refresh();
  };

  const renderInput = (label, type, index) => {
    const id = label.toLowerCase().replace(/ /g, '-');
    let valid = true;
    if (formElements.hasOwnProperty(id)) {
      valid = formElements[id].checkValidity();
      console.log('got el and valid:', valid);
    };

    return (
      <div class={ `fl w-100 w-${type === 'textarea' ? 'two-thirds' : 'third' }-ns` }>
        <div class={ `tl ph2 mt3 ${ id === 'label' ? 'ml3' : 'ml0' }` }>
        <label class="db fw6 lh-copy f6" for={ id }>
          { label }
        </label>
        { id !== 'note' ? (
          <input
            class={ `mr1 pa2 ba bg-transparent hover-bg-near-white ${ 
              type === 'checkbox' ? '' : 'w-100 input-reset' 
            } br2 ${ 
              !valid ? 'invalid' : '' 
            }` }
            onfocus={ onFocus }
            onblur={ onBlur }
            list={ type === 'select' ? `${id}s` : true }
            required={ type === 'checkbox' ? false : true }
            name={ id } id={ id }
            type={ type } />
          ) : (
            <textarea
              name={ id } id={ id }
              class="db border-box hover-black mw-100 w-100 ba b--black-60 pa2 br2 mb2" 
            />
          )}
          <span class={ `small mt1 fg-streamside-orange ${ valid && 'hidden' }` }>
            Field is required
          </span>&nbsp;
          { type === 'select' && (
            <datalist id={ `${id}s` }>
              { dataLists[label].map(el => <option>{ el }</option> )}
            </datalist>
          )}
        </div>
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

  const saveTodo = () => {
    const elements = document.getElementById('add-todo').elements;
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
    console.log('form elements', formElements);
    yield (
      <Fragment>
        <nav class="f6 fw6 ttu tracked ph3 pv2 pv3-ns tr">
          <a
            class="link dim mid-gray dib mr3 ba b--mid-gray br1 pa2"
            onclick={ showModal }
            href="#" title="Add box">Add todo</a>
        </nav>
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
              <div class="tc center">
                <h2 class="fw4">Add Todo.</h2>
              </div>
              { fetchError && <Error msg={fetchError} /> }
              { formError && <Error msg="Input failed validation please correct the errors." /> }
              { saving && (
                <div class="mv2 pt2 pl2 br3 ba b--dark-blue bg-washed-blue">
                  <p class="tc">Saving todo.</p>
                </div>
              )}
              { success && (
                <div class="lh-copy dark-gray pa3 br3 ba b--dark-gray bg-washed-green">
                  Successfully saved todo, reloading page.
                </div>
              )}
              { loading && <BarLoader /> }
              { !loading && !success && !fetchError && (
                <Fragment>
                  <form id="add-todo">
                    <fieldset id="add_order" class="w-90 center dark-gray tl ba b--transparent ph0 mh0">
                    <legend class="f4 fw6 ph0 mh0 dn">Add todo</legend>
                    { Object.keys(fields).map((key, index) => (
                      <div>
                        { renderInput(key, fields[key], index) }
                      </div>
                    ))}
                    </fieldset>
                  </form>
                  <div class="w-90 center ph1">
                    <Button
                      onclick={ saveTodo }>
                      Save todo
                    </Button>
                    <Button
                      onclick={ closeModal }>
                      Cancel
                    </Button>
                  </div>
                </Fragment>
              )}
            </div>
          </div>
        )}
      </Fragment>
    )
  };
};

module.exports = AddTodoModal;

