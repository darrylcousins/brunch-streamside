/** @jsx createElement */
/**
* @module app/lib/text-button
* @author Darryl Cousins <darryljcousins@gmail.com>
*/
import { createElement } from "@bikeshaving/crank/cjs";

const TextButton = (props) => {
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

export default TextButton;
