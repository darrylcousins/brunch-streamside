/** @jsx createElement */
import { createElement } from "@bikeshaving/crank/cjs";
import FieldWrapper from "./field-wrapper";

function InputSelectField(props) {
  const { label, id, size, valid, datalist } = props;

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
      <input
        class={`mr1 pa2 ba bg-transparent hover-bg-near-white w-100 input-reset br2 ${
          !valid ? "invalid" : ""
        }`}
        {...props}
        list={`${id}s`}
      />
      <span class={`small mt1 fg-streamside-orange ${valid ? "hidden" : ""}`}>
        { label }
        &nbsp;
        is required
      </span>
      &nbsp;
      <datalist id={`${id}s`}>
        {datalist.map((el) => (
          <option>{el}</option>
        ))}
      </datalist>
    </FieldWrapper>
  );
};

export default InputSelectField;
