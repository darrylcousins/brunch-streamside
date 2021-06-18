/** @jsx createElement */
/**
 * Provide a form component
 *
 * @module app/form/form
 * @requires module:app/form/field~Field
 * @author Darryl Cousins <darryljcousins@gmail.com>
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
   * Holds field length - used when collecting data
   *
   * @member {number} length
   */
  const { length } = Object.keys(fields);

  /**
   * Dynamic custom event to emit after validating form, the form wrapper
   * listens for this, the field length is included so the wrapper/controller
   * can keep count of data fields required
   *
   * @event module:app/form/form#validationEvent
   * @param {string} formId The form id
   * @param {boolean} valid The form validation state
   */
  const validationEvent = (formId, valid) =>
    new CustomEvent(`${formId}.valid`, {
      bubbles: true,
      detail: { valid, length },
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
  const formValidate = async () => {
    const { elements } = document.getElementById(id);
    let error = false;
    const elementsInError = [];
    Array.from(elements).forEach((element) => {
      const el = element; // avoiding no-param-reassign eslint
      if (el.tagName !== "FIELDSET" && el.type !== "hidden") {
        if (!el.checkValidity()) {

          // error indicators done after element refresh
          elementsInError.push(el);
          error = true;

        } else if (el.checkValidity()) {
          el.classList.remove("invalid");
          if (el.nextSibling) {
            el.nextSibling.innerHTML = "";
            el.nextSibling.classList.add("hidden");
          }
          if (el.previousSibling && el.previousSibling.classList) {
            el.previousSibling.classList.remove("fg-streamside-orange");
          }
        }
        formElements[el.name] = el;
      };
    });
    this.dispatchEvent(validationEvent(id, !error));
    formError = error;
    if (formError) {

      await this.refresh();

      // after refresh update dom field elements that did not validate
      for (const el of elementsInError) {
        el.classList.add("invalid");
        if (el.nextSibling) {
          el.nextSibling.innerHTML = el.validationMessage;
          el.nextSibling.classList.remove("hidden");
        }
        if (el.previousSibling && el.previousSibling.classList) {
          el.previousSibling.classList.add("fg-streamside-orange");
        }
        if (el.type === "file") {
          // file is the only generator field that needs this
          el.dispatchEvent(
            new CustomEvent("data.form.invalid", {
              bubbles: true,
              detail: { valid: false },
            })
          );
        }
      }
    }
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
          {Object.keys(fields).map((key, idx) => (
            <Fragment>
              <Field
                label={key}
                options={fields[key]}
                data={data}
                index={idx}
                formElements={formElements}
              />
            </Fragment>
          ))}
        </fieldset>
      </form>
    );
}

export default Form;
