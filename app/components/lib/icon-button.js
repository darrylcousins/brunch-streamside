/** @jsx createElement */
import { createElement } from "@bikeshaving/crank/cjs";

export default (props) => {
  const { children, color, title, name } = props;
  return (
    <button
      class={`pointer bn bg-transparent outline-0 ${color} dib dim`}
      name={name}
      title={title}
      type="button"
    >
      {children}
      <span class="dn">{title}</span>
    </button>
  );
};
