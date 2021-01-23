/** @jsx createElement */
import { createElement } from "@bikeshaving/crank/cjs";
import FieldWrapper from "./field-wrapper";

export default (props) => {
  const { label, valid, size, id, value, datatype } = props;
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
