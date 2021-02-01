/** @jsx createElement */
/**
 * Provide a form component
 *
 * @module app/form/form
 * @requires module:app/form/field~Field
 */
import { createElement, Fragment } from "@bikeshaving/crank/cjs";

import Error from "../lib/error";
import Field from "./fields";

/**
 * Constructs and returns form DOM element
 *
 * @generator
 * @yields {Element} A form
 * @param {object} props Property object
 * @param {object} props.id Unique id for the form
 * @param {object} props.data Field data for the form - initialData
 * @param {object} props.fields The fields to be displayed - described by objects
 * @param {string} props.title The form title
 */
function* Form(props) {
  const { id, data, fields, title } = props;

  /**
   * Holds user entered data to re-render after validation failure.
   *
   * @member {object} formElements
   */
  const formElements = {};

  /**
   * Holds form error state
   *
   * @member {boolean} formError
   */
  let formError = false;

  /**
   * Dynamic custom event to emit after validating form
   *
   * @event module:app/form/form#validationEvent
   * @param {string} formId The form id
   * @param {boolean} valid The form validation state
   */
  const validationEvent = (formId, valid) =>
    new CustomEvent(`${formId}.valid`, {
      bubbles: true,
      detail: { valid },
    });

  /**
   * Listens for  ${id}.validate which is a custom event fired by {@link
   * module:app/form/form-modal-wrapper~FormModalWrapper|FormModalWrapper} when
   * the `save` button is clicked. The form is located in the DOM and html
   * validation is called on each element. The elements and their values are
   * stored in {@link module:app/form/form~formElements|formElements}. If the
   * form fails validation the component is re-rendered and errors displayed.
   * If the form passes validation the event ${id}.valid is fired which is
   * listened for by {@link module:app/form/form-modal-wrapper~formValid|formValid} and the form
   * save action is continued.
   *
   * @function formValidate
   * @listens module:app/form/form-modal-wrapper#validateEvent
   * @fires module:app/form/form#validationEvent
   */
  const formValidate = () => {
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
    this.dispatchEvent(validationEvent(id, !error));
    formError = error;
    if (formError) this.refresh();
  };

  this.addEventListener(`${id}.validate`, formValidate);

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

export default Form;
