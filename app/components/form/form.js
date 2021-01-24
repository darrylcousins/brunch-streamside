/** @jsx createElement */
import { createElement, Fragment } from "@bikeshaving/crank/cjs";

import Error from "../lib/error";
import Field from "./fields";

export default function* Form(props) {
  const { id, data, fields, title } = props;

  const formElements = {};
  let formError = null;

  this.addEventListener(`${id}.validate`, () => {
    const { elements } = document.getElementById(id);
    let error = false;
    Array.from(elements).forEach((element) => {
      const el = element; // avoiding no-param-reassign eslint
      if (el.tagName !== "FIELDSET" && el.type !== "hidden") {
        if (!el.checkValidity()) {
          el.classList.add("invalid");
          if (el.nextSibling) {
            el.nextSibling.innerHTML = el.validationMessage;
            el.nextSibling.classList.remove("hidden");
          }
          if (el.type === "file") {
            // file is the only generator field that needs this
            el.dispatchEvent(
              new CustomEvent("invalid", {
                bubbles: true,
                detail: { valid: false },
              })
            );
          }
          error = true;
        } else if (el.checkValidity()) {
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
            <Fragment>
              <Field
                label={key}
                options={fields[key]}
                data={data}
                formElements={formElements}
              />
            </Fragment>
          ))}
        </fieldset>
      </form>
    );
}
