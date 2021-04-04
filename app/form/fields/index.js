/** @jsx createElement */
/**
 * A field component to render form elements
 *
 * @module app/form/index
 * @author Darryl Cousins <darryljcousins@gmail.com>
 */
import { createElement } from "@bikeshaving/crank/cjs";

import Checkbox from "./checkbox";
import CheckboxMultiple from "./checkbox-multiple";
import TextField from "./text";
import TextArea from "./textarea";
import Hidden from "./hidden";
import InputSelect from "./input-select";
import InputMultipleSelect from "./input-multiple";
import File from "./file";
import Error from "../../lib/error";

/**
 * A field component to render form elements
 *
 * @function Field
 * @param {object} props The property object
 * @param {object} props.data The form data containing current values
 * @param {object} props.formElements The formElements representing the rendered DOM
 * @param {string} props.label The label text
 * @param {object} props.options The field options
 * @param {string} props.options.id The form unique identifier for the field
 * @param {string} props.options.type The type of input field to render (text, checkbox, hidden etc)
 * @param {string} props.options.size The width of the field as per tachyons width values
 * @param {boolean} props.options.required Is this a required field
 * @param {Array} props.options.datalist The selectable values
 * @param {string} props.options.datatype The datatype of the returned values `string|integer|boolean`
 * @returns {Element} The field DOM component to be rendered
 */
function Field(props) {
  const { label, options, data, formElements } = props;
  const { type, size, required, datalist, datatype } = options;
  let { id } = options;

  if (typeof id === "undefined") {
    id = label.toLowerCase().replace(/ /g, "-");
  }
  let value = data[id]; // can be expected as undefined
  let valid = true;

  // see https://github.com/eslint/eslint/blob/master/docs/rules/no-prototype-builtins.md
  if (Object.prototype.hasOwnProperty.call(formElements, id)) {
    valid = formElements[id].checkValidity();
    if (formElements[id].value !== "undefined") {
      value = formElements[id].value;
    }
  }

  /**
   * Event handler on focus, remove invalid state of field
   *
   * @function onFocus
   * @param {object} ev The event
   * @listens focus
   */
  const onFocus = (ev) => {
    const el = ev.target;
    el.classList.remove("invalid");
    if (el.nextSibling) {
      el.nextSibling.innerHTML = "";
      el.nextSibling.classList.add("hidden");
    }
    if (el.previousSibling) {
      el.previousSibling.classList.remove("fg-streamside-orange");
    }
  };

  /**
   * Event handler on blur, add invalid state to field after checking for
   * validity using html5 validation
   *
   * @function onBlur
   * @param {object} ev The event
   * @listens blur
   */
  const onBlur = (ev) => {
    const el = ev.target;
    if (!el.checkValidity()) {
      if (el.nextSibling) {
        el.nextSibling.innerHTML = el.validationMessage;
        el.nextSibling.classList.remove("hidden");
      }
      if (el.previousSibling) {
        el.previousSibling.classList.add("fg-streamside-orange");
      }
    }
  };

  if (type === "hidden") {
    return (
      <Hidden value={value} name={id} type={type} id={id} datatype={datatype} />
    );
  }

  if (type === "file") {
    return (
      <File
        name={id}
        type={type}
        id={id}
        datatype={datatype}
        required={required}
        valid={valid}
      />
    );
  }

  if (type === "textarea") {
    return (
      <TextArea
        value={value}
        name={id}
        label={label}
        id={id}
        size={size}
        required={required}
        valid={valid}
        onfocus={onFocus} // addEventListener???
        onblur={onBlur}
        datatype={datatype}
      />
    );
  }

  if (type === "text") {
    return (
      <TextField
        value={value}
        name={id}
        label={label}
        id={id}
        size={size}
        required={required}
        valid={valid}
        onfocus={onFocus} // addEventListener???
        onblur={onBlur}
        datatype={datatype}
        type={type}
      />
    );
  }

  if (type === "checkbox") {
    return (
      <Checkbox
        value={value}
        name={id}
        label={label}
        id={id}
        size={size}
        required={required}
        valid={valid}
        datatype={datatype}
      />
    );
  }

  if (type === "input-select") {
    return (
      <InputSelect
        value={value}
        name={id}
        label={label}
        id={id}
        size={size}
        type={type}
        required={required}
        valid={valid}
        onfocus={onFocus} // addEventListener???
        onblur={onBlur}
        datalist={datalist}
        datatype={datatype}
      />
    );
  }

  if (type === "input-multiple") {
    return (
      <InputMultipleSelect
        value={value}
        name={id}
        label={label}
        id={id}
        type={type}
        size={size}
        required={required}
        valid={valid}
        onfocus={onFocus} // addEventListener???
        onblur={onBlur}
        datalist={datalist}
        datatype={datatype}
      />
    );
  }

  if (type === "checkbox-multiple") {
    return (
      <CheckboxMultiple
        value={value}
        name={id}
        label={label}
        id={id}
        type={type}
        size={size}
        required={required}
        valid={valid}
        onfocus={onFocus} // addEventListener???
        onblur={onBlur}
        datalist={datalist}
        datatype={datatype}
      />
    );
  }

  return <Error msg="Failed to find input element to render" />;
}

export default Field;
