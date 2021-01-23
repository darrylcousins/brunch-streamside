/** @jsx createElement */
import { createElement } from "@bikeshaving/crank/cjs";
import FieldWrapper from "./field-wrapper";

export default (props) => {
  const { label, id, value, valid, size } = props;
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
        Field is required
      </span>
      &nbsp;
    </FieldWrapper>
  );
};
