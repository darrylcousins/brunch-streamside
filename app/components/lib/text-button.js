/** @jsx createElement */
/**
 * TextButton module
 *
 * @module app/lib/text-button
 * @author Darryl Cousins <darryljcousins@gmail.com>
 */
import { createElement } from "@bikeshaving/crank/cjs";

/**
 * TextButton component using a html `button` tag.
 *
 * @returns {Element} DOM component as `svg` wrapper
 * @param {object} props  Component properties
 * @param {string} props.color Text colour (background transparent)
 * @param {string} props.title Button title (hover hint)
 * @param {string} props.name Button name attribute
 * @param {string} props.action Button `onclick` attribute
 */
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
      {title}
    </button>
  );
};

export default TextButton;
