/** @jsx createElement */
/**
* @module app/lib/icon-button
* @author Darryl Cousins <darryljcousins@gmail.com>
*/
import { createElement } from "@bikeshaving/crank/cjs";

/**
 * IconButton component, will normally have an eventListener attached to parent
 * component as in example below.
 *
 * @return {Element} DOM component
 * @param {Object} props  Component properties
 * @param {Element} props.children Nested child icon for display
 * @param {String} props.color Icon colour
 * @param {String} props.title Button title - hover hint and hidden span
 * @param {String} props.name Button name attribute
 * @example
 * const name = "download";
 * const title = "Download";
 * const color = "dark-gray";
 * const props = {name, color, title};
 * this.addEventListener("click", async (ev) => {
 *   // are we on the right target??
 *   if (ev.target.closest(`button[name='${name}']`)) {
 *     doDownload();
 *   }
 * });
 * <IconButton {...props}>
 *   <DownloadIcon />
 * </IconButton>
 */
const IconButton = (props) => {
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

export default IconButton;
