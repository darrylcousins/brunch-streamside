/** @jsx createElement */
import { createElement } from "@bikeshaving/crank/cjs";

import Checkbox from "./checkbox";
import TextField from "./text";
import TextArea from "./textarea";
import Hidden from "./hidden";
import Select from "./select";
import Multiple from "./multiple";
import File from "./file";

export default (props) => {
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

  // sould then be event listeners??
  const onFocus = (ev) => {
    const el = ev.target;
    el.classList.remove("invalid");
    el.nextSibling.innerHTML = "";
    el.nextSibling.classList.add("hidden");
  };

  const onBlur = (ev) => {
    const el = ev.target;
    if (!el.checkValidity()) {
      el.classList.add("invalid");
      el.nextSibling.innerHTML = el.validationMessage;
      el.nextSibling.classList.remove("hidden");
    }
  };

  if (type === "hidden") {
    return (
      <Hidden value={value} name={id} type={type} id={id} datatype={datatype} />
    );
  }

  if (type === "file") {
    return <File name={id} type={type} id={id} datatype={datatype} required={required} valid={valid} />;
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

  if (type === "select") {
    return (
      <Select
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

  if (type === "multiple") {
    return (
      <Multiple
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

  return <div class="b">Failed to find input element to render</div>;
};
