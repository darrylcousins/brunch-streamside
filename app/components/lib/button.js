/** @jsx createElement */
/**
 * Button module
 *
 * @module app/lib/button
 * @author Darryl Cousins <darryljcousins@gmail.com>
 */
import { createElement } from "@bikeshaving/crank/cjs";

/**
 * Button component
 *
 * @return {Element} DOM component
 * @param {Object} props  Component properties
 * @param {Object} props.children Nested child components
 * @param {String} props.type Button style `primary|secondary`
 * @param {String} props.title Button title - hover hint
 */
const Button = (props) => {
  const { children, type, title } = props;
  let classList;
  let hint = "";
  if (type === "secondary") {
    classList = "b--navy bg-near-white navy hover-bg-moon-gray";
  } else {
    classList = "b--navy bg-dark-blue white hover-bg-navy";
  }
  if (typeof title === "undefined" && typeof children === "string") {
    hint = children.toString();
  } else {
    hint = title;
  }
  return (
    <button
      {...props}
      title={hint}
      type="button"
      class={`pointer br2 ba pa2 ml1 mv1 bg-animate border-box ${classList}`}
    >
      {children}
    </button>
  );
};

export default Button;
