/** @jsx createElement */
import { createElement } from "@bikeshaving/crank/cjs";
import FieldWrapper from "./field-wrapper";

function *CheckboxMultiple(props) {
  const { label, id, size, valid, datalist, datatype } = props;
  let value = false;
  console.log(datatype);

  const slugify = (str) => str.toLowerCase().replace(/ /g, "-");
  const name = slugify(label);
  let selected = datalist.map(src => slugify(src));

  console.log('selected', selected, id);

  const isChecked = (src) =>
    selected.includes(slugify(src));

  const updateSelected = (id, remove) => {
    console.log('id in updat', id);
    if (id === "") return;
    const idx = selected.indexOf(id);
    if (idx === -1 && !remove) {
      selected.push(id);
    } else if (idx > -1 && remove) {
      selected.splice(idx, 1);
    }
  };

  const handleClick = async (ev) => {
    const tagName = ev.target.tagName.toUpperCase();
    if (tagName === "BUTTON") {
      const selectAll = ev.target.name === "all" ? false : true;
      console.log('buton name:', ev.target.name, selectAll);
      document.querySelectorAll(`input[name='${name}']`).forEach((el) => {
        updateSelected(el.id, selectAll);
      });
      this.refresh();
    }
    if (tagName === "LABEL" || tagName === "INPUT") {
      if (ev.target.value) {
        updateSelected(ev.target.id, !ev.target.checked);
      }
      this.refresh();
    }
  };

  this.addEventListener("click", handleClick);

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
                id={`${name}[]`}
                value={slugify(source)}
                name={`${name}[]`}
                checked={isChecked(source)}
              />
              <label
                for={slugify(source)}
                htmlFor={slugify(source)}
                class="lh-copy"
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
