/** @jsx createElement */
import { createElement } from "@bikeshaving/crank/cjs";
import FieldWrapper from "./field-wrapper";

function CheckboxField(props) {
  const { label, valid, size, id, value, datatype } = props;

  this.addEventListener("form.data.collect", (ev) => {
    const value = ev.target.checked;
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
        class={`mr1 pa2 ba bg-transparent hover-bg-near-white br2 db ${
          !valid ? "invalid" : ""
        }`}
        type="checkbox"
        checked={value}
        id={id}
        name={id}
        datatype={datatype}
      />
    </FieldWrapper>
  );
};

export default CheckboxField;
