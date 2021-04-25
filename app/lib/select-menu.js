/** @jsx createElement */
/**
 * Component
 *
 * @module app/product-description
 * @exports {Element} SelectDeliveryDate
 * @author Darryl Cousins <darryljcousins@gmail.com>
 */
import { createElement, Fragment } from "@bikeshaving/crank/cjs";

/**
 * Renders a text button
 *
 * @generator
 * @param {object} props The property object
 * @param {string} props.text The display text - will be slugified to create name/id
 * @param {number} props.index The index of the menu array - used to add borders and border radius to group multiple items
 * @param {array} props.array The menu array that this is a part of
 * @param {string} props.title Text used for visual hint on hover
 * @param {string} props.name Used to identify the action when listening for click on the component
 * @param {string|number} props.item Added to `data-item` attribute and is the object collected and used in final action
 * @yields {Element} A text button
 */
function TextButton({ text, index, array, title, name, item }) {
  /**
   * Style selection according to props.position to add rounded corners as
   * necessary to render grouped elements
   *
   * @member {string}
   */
  let position;
  switch(index) {
    case 0:
      position = "top";
      break;
    case (array.length - 1):
      position = "bottom";
      break;
    default:
      position = "center";
  }
  if (array.length === 1) position = "single";
  let borders = "ba";
  if (position === "top") borders = "br bl bt bb-0 br2 br--top";
  if (position === "center") borders = "bl br bb-0 bt-0 br--top br2 br--top br--bottom";
  if (position === "bottom") borders = "br bl bb bt-0 br2 br--bottom";
  if (position === "single") borders = "ba br2";

  // throw back from wierd product titles
  const slug = text.replace(/ /g, '-');
  // possibly also not required
  const type = (name === "selectDate") ? "ttu tracked" : "";

  return (
    <button
      class={`w-100 f6 ${type} outline-0 dark-gray b--gray ${borders} bg-transparent pointer pa0`}
      title={text}
      name={slug}
      id={slug}
      type="button"
      >
        <div
          name={name}
          class="dim bg-animate hover-bg-near-white pa1"
          data-item={item}
          data-title={text}
        >
          { text }
        </div>
      </button>
  );
}

/**
 * Component
 *
 * @returns {Element} DOM component
 * <SelectMenu
 *   id="selectDate"
 *   menu={fetchDates.map(el => ({text: el, item: el}))}
 *   title="Select Date"
 *   active={menuSelectDate}
 * >
 *   { selectedDate ? selectedDate : "Select delivery date" }&nbsp;&nbsp;&nbsp;&#9662;
 * </SelectMenu>
 */
function *SelectMenu ({ id, active, title, menu, children, style }) {
  const type = (id.startsWith("selectDate")) ? "ttu tracked" : "";
  console.log(style);

  for ({ id, active, title, menu, children, style } of this) {
    yield (
      <Fragment>
        <div class="relative">
          <button
            class={`dib w-100 f6 ${type} outline-0 gray b--gray ba ba1 bg-transparent br2 pa2 mb1 pointer`}
            title={title}
            id={id}
            type="button"
            style={style}
            >
            { children }
          </button>
          { active && (
            <div class="absolute w-100 bg-white br2 z-9999">
            {menu.map((el, idx, arr) => (
              <TextButton text={el.text} index={idx} array={arr} name={id} item={el.item} />
            ))}
            </div>
          )}
        </div>
      </Fragment>
    )
  }
};

export default SelectMenu;
