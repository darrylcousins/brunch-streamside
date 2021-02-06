/** @jsx createElement */
/**
 * A component for a hidden element
 *
 * @module app/form/hidden
 * @author Darryl Cousins <darryljcousins@gmail.com>
 */
import { createElement } from "@bikeshaving/crank/cjs";

/**
 * A component for a hidden element
 *
 * @generator
 * @param {object} props The property object
 * @param {string} props.id The form unique identifier for the field
 * @param {string} props.datatype The datatype of the returned values `string|integer|boolean`
 * @yields {Element} A hidden input field as DOM component
 */
function* HiddenField(props) {
  const { id, datatype } = props;

  /**
   * Event handler when {@link
   * module:form/form-modal~FormModalWrapper|FormModalWrapper} sends for data
   *
   * @function collectAndSendData
   * @param {object} ev The event
   * @listens form.data.feed
   */
  const collectAndSendData = (ev) => {
    let { value } = ev.target;
    if (ev.target.id === id) {
      if (datatype === "integer") {
        value = parseInt(value, 10);
      }
      if (datatype === "array") {
        value = value.split(",").filter((item) => item !== "");
      }
      this.dispatchEvent(
        new CustomEvent("form.data.feed", {
          bubbles: true,
          detail: {
            id,
            value,
          },
        })
      );
    }
  };

  this.addEventListener("form.data.collect", collectAndSendData);

  while (true) {
    yield <input {...props} />;
  }
}

export default HiddenField;
