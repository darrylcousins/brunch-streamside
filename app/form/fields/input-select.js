/** @jsx createElement */
/**
 * Component to render an input field with selectable
 * values using html5 datalist attribute
 *
 * @module app/form/input-select
 * @author Darryl Cousins <darryljcousins@gmail.com>
 */
import { createElement } from "@bikeshaving/crank/cjs";
import FieldWrapper from "./field-wrapper";

/**
 * Component to render an input field with selectable
 * values using html5 datalist attribute
 *
 * @generator
 * @param {object} props The property object
 * @param {string} props.label The label text
 * @param {string} props.id The form unique identifier for the field
 * @param {string} props.size The width of the field as per tachyons width values
 * @param {Array} props.datalist The selectable values
 * @param {string} props.valid Is the current selection valid
 * @yields {Element} DOM component to render input field with selectable values
 * using datalist attribute
 *
 */
function* InputSelectField({ label, id, value, size, valid, datatype, datalist, disabled, hideLabel, ...props}) {

  /**
   * Event handler when {@link
   * module:form/form-modal~FormModalWrapper|FormModalWrapper} sends for data
   *
   * @function collectAndSendData
   * @param {object} ev The event
   * @listens form.data.feed
   */
  const collectAndSendData = (ev) => {
    if (ev.target.id === id) {
      this.dispatchEvent(
        new CustomEvent("form.data.feed", {
          bubbles: true,
          detail: {
            id,
            value: ev.target.value,
          },
        })
      );
    }
  };

  this.addEventListener("form.data.collect", collectAndSendData);

  /**
   * Event handler on focus, remove value to allow dropdown
   *
   * @function onFocus
   * @param {object} ev The event
   * @listens focus
   */
  const onClick = (ev) => {
    if (!disabled) {
      const el = document.querySelector(`input[name='${props.name}']`);
      el.value = "";
      //el.select();
    }
  };

  this.addEventListener("click", onClick);

  for ({ label, id, value, size, valid, datalist, datatype, disabled, hideLabel } of this) {
    yield (
      <FieldWrapper label={label} size={size} id={id} hideLabel={hideLabel}>
        <input
          class={`mr1 pa2 ba bg-transparent hover-bg-near-white w-90 input-reset br2 ${
            !valid ? "invalid" : ""
          }`}
          disabled={disabled}
          value={value}
          id={id}
          {...props}
          list={`${id}s`}
        />
        <span class={`small mt1 fg-streamside-orange ${valid ? "hidden" : ""}`}>
          {label}
          &nbsp; is required
        </span>
        &nbsp;
        <datalist id={`${id}s`}>
          {datalist.map((el) => (
            <option>{el}</option>
          ))}
        </datalist>
      </FieldWrapper>
    );
  }
}

export default InputSelectField;
