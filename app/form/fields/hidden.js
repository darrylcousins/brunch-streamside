/** @jsx createElement */
/**
*
* @module app/form/hidden
* @author Darryl Cousins <darryljcousins@gmail.com>
*/
import { createElement } from "@bikeshaving/crank/cjs";

/**
*
* @function HiddenField
* @param {object} props The property object
*/
function HiddenField(props) {
  const { id, datatype } = props;

  this.addEventListener("form.data.collect", (ev) => {
    let value = ev.target.value;
    if (datatype === "integer") {
      value = parseInt(value, 10);
    }
    if (datatype === "array") {
      value = value.split(",").filter((item) => item !== "");
    }
    if (ev.target.id === id) {
      this.dispatchEvent(
        new CustomEvent("form.data.feed", {
          bubbles: true,
          detail: {
            id,
            value
          }
        })
      );
    }
  });

  return <input {...props} />;
};

export default HiddenField;
