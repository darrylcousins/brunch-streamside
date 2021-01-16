/** @jsx createElement */
import {createElement, Fragment} from '@bikeshaving/crank/cjs';

import Error from '../lib/error';
import Field from './fields';

function *Form(props) {

  const { id, data, fields, title } = props;

  let formElements = {};
  let formError = null;

  this.addEventListener(`${id}.validate`, ev => {
    const elements = document.getElementById(id).elements;
    let el;
    let error = false;
    for (let i=0; i<elements.length; i++) {
      el = elements[i];
      if (el.tagName !== 'FIELDSET' && el.type !== 'hidden') {
        console.log(el.tagName);
        if (!el.checkValidity()) {
          //el.dispatchEvent(new Event('onblur')); // NOT WORKING BUT WAS?
          el.classList.add('invalid');
          if (el.nextSibling) {
            el.nextSibling.innerHTML = el.validationMessage;
            el.nextSibling.classList.remove('hidden');
          }
          error = true;
        } else if (el.checkValidity()) {
          //el.dispatchEvent(new Event('onfocus')); // NOT WORKING BUT WAS?
          el.classList.remove('invalid');
          console.log(el.nextSibling);
          if (el.nextSibling) {
            el.nextSibling.innerHTML = '';
            el.nextSibling.classList.add('hidden');
          }
        };
        formElements[el.name] = el;
      };
    };
    this.dispatchEvent(
      new CustomEvent(`${id}.valid`, {
        bubbles: true,
        detail: { valid: !error }
      })
    );
    formError = error;
    if (!formError) this.refresh();
  });

  while (true) (
    yield ( 
      <form id={ id }>
        { formError && <Error msg="Input validation failed, please correct the errors." /> }
        <fieldset class="w-100 center dark-gray tl ba b--transparent ph0 mh0">
        <legend class="f4 fw6 ph0 mh0 dn">{ title }</legend>
        { Object.keys(fields).map((key, index) => (
          <Field
            label={ key }
            options={ fields[key] }
            data={ data }
            formElements={ formElements }
          />
        ))}
        </fieldset>
      </form>
    )
  )
};

module.exports = Form;
