/** @jsx createElement */
import { createElement } from "@bikeshaving/crank/cjs";
import FieldWrapper from "./field-wrapper";

export default (props) => {
  const { label, id, size, valid } = props;
  return (
    <FieldWrapper label={label} size={size} id={id}>
      <input
        class={`mr1 pa2 ba bg-transparent hover-bg-near-white w-100 input-reset br2 ${
          !valid ? "invalid" : ""
        }`}
        {...props}
      />
      <span class={`small mt1 fg-streamside-orange ${valid ? "hidden" : ""}`}>
        { label }
        is required
      </span>
      &nbsp;
    </FieldWrapper>
  );
};
