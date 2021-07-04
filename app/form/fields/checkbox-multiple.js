/** @jsx createElement */
/**
 * Exports a multiple checkbox form field
 *
 * @module app/form/checkbox-multiple
 * @author Darryl Cousins <darryljcousins@gmail.com>
 */
import { createElement } from "@bikeshaving/crank/cjs";
import FieldWrapper from "./field-wrapper";

/**
 * Renders a multiple checkbox field. Includes a `select all`/`deselect all`
 * button. The resulting data is returned as an array of values.
 *
 * @generator
 * @param {object} props The property object
 * @param {string} props.label The label text
 * @param {string} props.id The form unique identifier for the field
 * @param {string} props.size The width of the field as per tachyons width values
 * @param {Array} props.datalist The selectable values
 * @param {string} props.datatype The datatype of the returned values `string|integer|boolean`
 * @yields {Element} List of checkboxes as DOM component
 */
function* CheckboxMultiple(props) {
  const { label, id, size, datalist } = props;

  /**
   * Slugify a value - i.e. remove spaces and put to lower case
   *
   * @function slugify
   * @param {string} str The input string
   * @returns {string} The slugified string
   */
  const slugify = (str) => str.toLowerCase().replace(/ /g, "-");

  /**
   * Store the array of selected values
   *
   * @member {Array} selected
   */
  const selected = datalist.map((value) => slugify(value));

  /**
   * Store a map of selected slugs to actual values
   *
   * @member selectedMap
   */
  const selectedMap = {};
  datalist.forEach((el) => {
    selectedMap[slugify(el)] = el;
  });

  /**
   * Helper method to determine if a value is checked/selected
   *
   * @function isChecked
   * @param {string} value The value to check for in
   * {@link module:app/form/checkbox-multiple~selected|selected}
   */
  const isChecked = (value) => selected.includes(slugify(value));

  /**
   * Helper method to update the selected array when an item is checked
   *
   * @function updateSelected
   * @param {string} value The value to add or remove from
   * {@link module:app/form/checkbox-multiple~selected|selected}
   * @param {boolean} remove Removing or adding to
   * {@link module:app/form/checkbox-multiple~selected|selected}?
   */
  const updateSelected = (value, remove) => {
    if (value === "") return;
    const idx = selected.indexOf(value);
    if (idx === -1 && !remove) {
      selected.push(value);
    } else if (idx > -1 && remove) {
      selected.splice(idx, 1);
    }
  };

  /**
   * Event handler on user click to update selected array
   *
   * @function handleClick
   * @param {object} ev The event
   * @listens click
   */
  const handleClick = async (ev) => {
    const tagName = ev.target.tagName.toUpperCase();
    if (tagName === "BUTTON") {
      const selectAll = ev.target.name !== "all";
      document.querySelectorAll(`input[name='${id}']`).forEach((el) => {
        updateSelected(el.id, selectAll);
      });
      this.refresh();
    }
    if (tagName === "LABEL" || tagName === "INPUT") {
      const el =
        tagName === "LABEL" ? ev.target.previousElementSibling : ev.target;
      updateSelected(el.id, !el.checked);
      this.refresh();
    }
  };

  this.addEventListener("click", handleClick);

  /**
   * Event handler when {@link
   * module:form/form-modal~FormModalWrapper|FormModalWrapper} sends for data
   *
   * @function collectAndSendData
   * @param {object} ev The event
   * @listens form.data.feed
   */
  const collectAndSendData = (ev) => {
    if (ev.target.name === id) {
      // note use of name here
      this.dispatchEvent(
        new CustomEvent("form.data.feed", {
          bubbles: true,
          detail: {
            id,
            value: selected.map((el) => selectedMap[el]), // TODO datatype!
          },
        })
      );
    }
  };

  this.addEventListener("form.data.collect", collectAndSendData);

  while (true) {
    yield (
      <FieldWrapper label={label} size={size} id={id} hideLabel={props.hideLabel}>
        <div class="mt2">
          <div class="flex items-center mb1 dark-gray">
            <button
              class="pointer bn bg-transparent outline-0 dib dim pl0"
              type="button"
              name={selected.length === 0 ? "all" : "none"}
            >
              {selected.length === 0 ? "Select all" : "Deselect all"}
            </button>
          </div>
          {datalist.map((source) => (
            <div class="flex items-center mb1 dark-gray">
              <input
                class="mr2"
                type="checkbox"
                value={slugify(source)}
                id={slugify(source)}
                name={id}
                checked={isChecked(source)}
              />
              <label
                htmlFor={slugify(source)}
                for={slugify(source)}
                name={slugify(source)}
                class="lh-copy pointer"
              >
                {source}
              </label>
            </div>
          ))}
        </div>
      </FieldWrapper>
    );
  }
}

export default CheckboxMultiple;
