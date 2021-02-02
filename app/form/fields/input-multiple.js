/** @jsx createElement */
/**
*
* @module app/form/input-multiple
* @author Darryl Cousins <darryljcousins@gmail.com>
*/
import { createElement } from "@bikeshaving/crank/cjs";
import FieldWrapper from "./field-wrapper";

/**
*
* @function InputMultipleSelect
* @param {object} props The property object
*/
function* InputMultipleSelect(props) {
  const { label, id, size, valid, datalist, value } = props;

  const separator = ",";
  let valueCount;
  let optionsValues;

  if (value && typeof value !== "undefined") {
    optionsValues = datalist;
    if (typeof value === "string") {
      valueCount = value.split(separator).length;
    } else {
      valueCount = value.length;
    }
  } else {
    // initialize
    valueCount = null;
    optionsValues = null;
  }

  const filldatalist = (input, optionValues, optionPrefix) => {
    const { list } = input;
    if (list && optionValues.length > 0) {
      list.innerHTML = "";
      const usedOptions = optionPrefix.split(separator).map((el) => el.trim());
      // for (const optionsValue of optionValues) {
      optionValues.forEach((optionsValue) => {
        if (usedOptions.indexOf(optionsValue) < 0) {
          // Skip used values
          const option = document.createElement("option");
          option.value = optionPrefix + optionsValue;
          list.append(option);
        }
      });
    }
  };

  this.addEventListener("input", (ev) => {
    console.log("got event on input");
    if (ev.target.tagName === "INPUT") {
      const input = ev.target;
      if (valueCount === null) {
        optionsValues = Array.from(input.list.options).map((opt) => opt.value);
        valueCount = input.value.split(separator).length;
      }
      const currentValueCount = input.value.split(separator).length;
      if (valueCount !== currentValueCount) {
        const lsIndex = input.value.lastIndexOf(separator);
        const str =
          lsIndex !== -1 ? input.value.substr(0, lsIndex) + separator : "";
        filldatalist(input, optionsValues, str);
        valueCount = currentValueCount;
      }
    }
  });

  this.addEventListener("form.data.collect", (ev) => {
    const value = ev.target.value.split(',');
    if (ev.target.id === id) {
      this.dispatchEvent(
        new CustomEvent("form.data.feed", {
          bubbles: true,
          detail: {
            id,
            value
          }
        })
      );
    }
  });

  while (true)
    yield (
      <FieldWrapper label={label} size={size} id={id}>
        <input
          class={`mr1 pa2 ba bg-transparent hover-bg-near-white w-100 input-reset br2 ${
            !valid ? "invalid" : ""
          }`}
          list={`${id}s`}
          {...props}
        />
        <span class={`small mt1 fg-streamside-orange ${valid && "hidden"}`}>
          {label} is required
        </span>
        &nbsp;
        <datalist id={`${id}s`}>
          {datalist.map((el) => (
            <option>{el}</option>
          ))}
        </datalist>
      </FieldWrapper>
    );
}

export default InputMultipleSelect;
