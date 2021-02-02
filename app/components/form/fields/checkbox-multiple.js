/** @jsx createElement */
import { createElement } from "@bikeshaving/crank/cjs";
import FieldWrapper from "./field-wrapper";

function *CheckboxMultiple(props) {
  const { label, id, size, valid, datalist, datatype } = props;
  let value = false;

  const slugify = (str) => str.toLowerCase().replace(/ /g, "-");
  const name = slugify(label);
  let selected = datalist.map(src => slugify(src));

  const isChecked = (src) =>
    selected.includes(slugify(src));

  const updateSelected = (id, remove) => {
    console.log('Updating:', id, remove);

    if (id === "") return;
    const idx = selected.indexOf(id);
    if (idx === -1 && !remove) {
      selected.push(id);
    } else if (idx > -1 && remove) {
      selected.splice(idx, 1);
    }
    console.log(selected);
  };

  const handleClick = async (ev) => {
    const tagName = ev.target.tagName.toUpperCase();
    console.log(tagName);
    if (tagName === "BUTTON") {
      const selectAll = ev.target.name === "all" ? false : true;
      document.querySelectorAll(`input[name='${id}']`).forEach((el) => {
        updateSelected(el.id, selectAll);
      });
      this.refresh();
    }
    if (tagName === "LABEL" || tagName === "INPUT") {
      const el = (tagName === "LABEL") ? ev.target.previousElementSibling : ev.target;
      const checked = (tagName === "LABEL") ? !el.checked : el.checked;
      updateSelected(el.id, !checked);
      this.refresh();
    }
  };

  this.addEventListener("click", handleClick);

  this.addEventListener("form.data.collect", (ev) => {
    if (ev.target.name === id) {  // note use of name here
      this.dispatchEvent(
        new CustomEvent("form.data.feed", {
          bubbles: true,
          detail: {
            id,
            value: selected
          }
        })
      );
    }
  });

  while (true) {
    yield (
      <FieldWrapper label={label} size={size} id={id}>
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
};

export default CheckboxMultiple;
