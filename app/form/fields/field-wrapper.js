/** @jsx createElement */
/**
*
* @module app/form/field-wrapper
* @author Darryl Cousins <darryljcousins@gmail.com>
*/
import { createElement } from "@bikeshaving/crank/cjs";

/**
*
* @function FieldWrapper
* @param {object} props The property object
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
};

export default FieldWrapper;
