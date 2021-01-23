/** @jsx createElement */
import { createElement } from "@bikeshaving/crank/cjs";

import Error from "../lib/error";
import Field from "./fields/index";

function* Form(props) {
  const { id, data, fields, title } = props;

  const formElements = {};
  let formError = null;

  this.addEventListener(`${id}.validate`, () => {
    const { elements } = document.getElementById(id);
    let error = false;
    elements.forEach((element) => {
      const el = element; // avoiding no-param-reassign eslint
      if (el.tagName !== "FIELDSET" && el.type !== "hidden") {
        if (!el.checkValidity()) {
          // el.dispatchEvent(new Event('onblur')); // NOT WORKING BUT WAS?
          el.classList.add("invalid");
          if (el.nextSibling) {
            el.nextSibling.innerHTML = el.validationMessage;
            el.nextSibling.classList.remove("hidden");
          }
          error = true;
        } else if (el.checkValidity()) {
          // el.dispatchEvent(new Event('onfocus')); // NOT WORKING BUT WAS?
          el.classList.remove("invalid");
          if (el.nextSibling) {
            el.nextSibling.innerHTML = "";
            el.nextSibling.classList.add("hidden");
          }
        }
        formElements[el.name] = el;
      }
    });
    this.dispatchEvent(
      new CustomEvent(`${id}.valid`, {
        bubbles: true,
        detail: { valid: !error },
      })
    );
    formError = error;
    if (formError) this.refresh();
  });

  while (true)
    yield (
      <form id={id}>
        {formError && (
          <Error msg="Input validation failed, please correct the errors." />
        )}
        <fieldset class="w-100 center dark-gray tl ba b--transparent ph0 mh0">
          <legend class="f4 fw6 ph0 mh0 dn">{title}</legend>
          {Object.keys(fields).map((key) => (
            <Field
              label={key}
              options={fields[key]}
              data={data}
              formElements={formElements}
            />
          ))}
        </fieldset>
      </form>
    );
}

module.exports = Form;
