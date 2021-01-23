/** @jsx createElement */
import { createElement } from "@bikeshaving/crank/cjs";

export default (props) => {
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
