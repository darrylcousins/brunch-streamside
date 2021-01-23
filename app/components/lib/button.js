/** @jsx createElement */
import { createElement } from "@bikeshaving/crank/cjs";

export default (props) => {
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
