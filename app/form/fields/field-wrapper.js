/** @jsx createElement */
/**
 * Field wrapper supplying the label for the wrapped form element and
 * conforming styles
 *
 * @module app/form/field-wrapper
 * @author Darryl Cousins <darryljcousins@gmail.com>
 */
import { createElement } from "@bikeshaving/crank/cjs";

/**
 * Simple wrapper to give conformity of style and label to all field elements
 *
 * @function FieldWrapper
 * @param {object} props The property object
 * @param {string} props.label The label text
 * @param {string} props.children The wrapped elements
 * @param {string} props.size The width of the field as per tachyons width values
 * @param {string} props.id The id of the wrapped element
 * @returns {Element} A wrapped label and child component
 */
function FieldWrapper(props) {
  const { children, label, size, id } = props;
  return (
    <div class={`fl w-100 w-${size}-ns`}>
      <div class="tl ph2 mt1 ml0">
        <label class="fw6 lh-copy f6" htmlFor={id} for={id}>
          {label}
        </label>
        {children}
      </div>
    </div>
  );
}

export default FieldWrapper;
