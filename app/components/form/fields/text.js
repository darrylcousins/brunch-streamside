/** @jsx createElement */
import { createElement } from "@bikeshaving/crank/cjs";
import FieldWrapper from "./field-wrapper";

function TextField(props) {
  const { label, id, size, valid } = props;

  this.addEventListener("getdata", (ev) => {
    console.log('Got event data', ev.target.value);
  });

  return (
    <FieldWrapper label={label} size={size} id={id}>
      <input
        class={`mr1 pa2 ba bg-transparent hover-bg-near-white w-100 input-reset br2 ${
          !valid ? "invalid" : ""
        }`}
        {...props}
      />
      <span class={`small mt1 fg-streamside-orange ${valid ? "hidden" : ""}`}>
        { label }&nbsp;
        is required
      </span>
      &nbsp;
    </FieldWrapper>
  );
};

export default TextField;
