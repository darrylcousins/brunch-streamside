/** @jsx createElement */
import { createElement } from "@bikeshaving/crank/cjs";

export default (props) => {
  const { color, name, title, action } = props;
  return (
    <button
      class={`f6 fw6 ttu tracked ${color} b--${color} ba ba1 bg-transparent br2 ph2 pv1 dim pointer`}
      onClick={action}
      title={title}
      name={name}
      type="button"
    >
      { title }
    </button>
  );
};

