/** @jsx createElement */
import { createElement } from "@bikeshaving/crank/cjs";
import Error from "../../lib/error";

// TODO 1. add file types allowed, 2. add multiple
export default function* FileField(props) {
  const { label, id, size, required } = props;
  let { valid } = props;

  let selected = null;
  let error = false;

  this.addEventListener("change", async (ev) => {
    if (ev.target.tagName === "INPUT" && ev.target.type === "file") {
      [selected] = ev.target.files;
      error = false;
      console.log(selected);
      /*
      if (!selected.name.endsWith('csv') && !selected.name.endsWith('xlsx')) {
        error = <div>Upload cancelled, expected the file to be a spreadsheet (<code>csv</code> or <code>xlsx</code>).</div>;
        selected = null;
      }
      */
      if (selected.type !== 'text/csv' && selected.type !== 'application/vnd.ms-excel' && selected.type !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
        error = <div>Upload cancelled, expected the file to be a spreadsheet (<code>csv</code> or <code>xlsx</code>).</div>;
        selected = null;
      }
      console.log('Selected file:', selected, error);
      this.refresh();
      if (!error) {
        const showFile = document.getElementById(`selected-${id}`);
        showFile.classList.remove('dn');
      }
    }
  });

  this.addEventListener("invalid", async (ev) => {
    valid = ev.detail.valid;
    this.refresh();
  });

  this.addEventListener("form.data.collect", (ev) => {
    const [value] = ev.target.files;
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

  while (true)
    yield (
      <div class={`fl w-100 w-${size}-ns`}>
        <div class="tl ph2 mt1 ml0">
          <label
            htmlFor={id}
            for={id}
            class="pointer link dim mid-gray f6 fw6 ttu tracked dib mr3 ba b--mid-gray br2 pa2"
            title="Select file"
          >
            Select file
          </label>
          <input type="file" name={id} id={id} hidden required={required} />
          <span class={`small mt1 fg-streamside-orange ${valid ? "hidden" : ""}`}>
            Please select a file
          </span>
          {selected && (
            <div class="dark-gray mv2 pa3 br3 ba b--dark-gray bg-washed-blue dn" id={`selected-${id}`}>
              Selected file for import:
              <span class="code">{selected.name}</span>
              .
            </div>
          )}
          {error && <Error msg={error} />}
        </div>
      </div>
    );
}
  /*
      <FieldWrapper label={label} size={size} id={id}>
        <label
          htmlFor={id}
          class="pointer link dim mid-gray f6 fw6 ttu tracked dib mr3 ba b--mid-gray br2 pa2"
          title="Select file"
        >
          <input type="file" id={id} hidden required={required} />
          <span class={`small mt1 fg-streamside-orange ${valid && "hidden"}`}>
          Select file
        </label>
        {selected && (
          <div class="dark-gray mv2 pa3 br3 ba b--dark-gray bg-washed-blue">
            Selected file for import:
            <span class="code">{selected.name}</span>
            .
          </div>
        )}
        {error && <Error msg={error} />}
      </FieldWrapper>
      */
