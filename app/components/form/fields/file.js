/** @jsx createElement */
import {createElement, Fragment} from '@bikeshaving/crank/cjs';
import FieldWrapper from './field-wrapper';
import Error from '../../lib/error';
import BarLoader from '../../lib/bar-loader';

// TODO 1. add file types allowed, 2. add multiple
function *FileField(props) {
  const {
    label,
    id,
    size,
    valid,
    onblur,
    onfocus
  } = props;

  let selected = null;
  let error = false;

  this.addEventListener('change', async (ev) => {
    if (ev.target.tagName === 'INPUT' && ev.target.type === 'file') {
      selected = ev.target.files[0];
      error = false;
      /*
      if (!selected.name.endsWith('csv') && !selected.name.endsWith('xlsx')) {
        error = <div>Upload cancelled, expected the file to be a spreadsheet (<code>csv</code> or <code>xlsx</code>).</div>;
        selected = null;
      }
      if (selected.type !== 'text/csv' && selected.type !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
        error = <div>Upload cancelled, expected the file to be a spreadsheet (<code>csv</code> or <code>xlsx</code>).</div>;
        selected = null;
      }
      */
      //error = <div>Upload cancelled, expected the file to be a spreadsheet (<code>csv</code> or <code>xlsx</code>).</div>;
      console.log(selected, error);
    };
    this.refresh();
  });

  while (true) (
    yield (
      <FieldWrapper label={label} size={size} id={id}>
        <input type="file" id={ id } hidden />
        <label
          for={ id }
          class="pointer link dim mid-gray f6 fw6 ttu tracked dib mr3 ba b--mid-gray br2 pa2"
          title="Select file">Select file</label>
        { selected && (
          <div class="dark-gray mv2 pa3 br3 ba b--dark-gray bg-washed-blue">
            Selected file for import: <span class="code">{ selected.name }</span>.
          </div>
        )}
        { error && (
          <Error msg={ error } />
        )}
      </FieldWrapper>
    )
  )
}

module.exports = FileField;

