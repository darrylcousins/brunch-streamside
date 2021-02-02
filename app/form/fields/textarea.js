/** @jsx createElement */
/**
*
* @module app/form/textarea
* @author Darryl Cousins <darryljcousins@gmail.com>
*/
import { createElement } from "@bikeshaving/crank/cjs";
import FieldWrapper from "./field-wrapper";

/**
*
* @function TextAreaField
* @param {object} props The property object
*/
function TextAreaField(props) {
  const { label, id, value, valid, size } = props;

  this.addEventListener("form.data.collect", (ev) => {
    const value = ev.target.value;
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

  return (
    <FieldWrapper label={label} size={size} id={id}>
      <textarea
        class={`mr1 pa2 ba bg-transparent hover-bg-near-white w-100 input-reset br2 ${
          !valid ? "invalid" : ""
        }`}
        {...props}
      >
        {value || ""}
      </textarea>
      <span class={`small mt1 fg-streamside-orange ${valid && "hidden"}`}>
        {label} is required
      </span>
      &nbsp;
    </FieldWrapper>
  );
};

export default TextAreaField;
