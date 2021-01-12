/** @jsx createElement */
require('isomorphic-fetch');
import {createElement, Fragment} from '@bikeshaving/crank/cjs';
import BarLoader from '../lib/bar-loader';
import Error from '../lib/error';

function *UploadOrders() {

  let loading;
  let error;
  let selected;
  let success;

  const reset = () => {
    loading = false;
    error = null;
    selected = null;
  };
  reset();

  this.addEventListener('change', async (ev) => {
    if (ev.target.tagName === 'INPUT' && ev.target.type === 'file') {
      selected = ev.target.files[0];
      error = false;

      console.log(selected);

      if (selected.type !== 'text/csv' && selected.type !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
        error = <div>Upload cancelled, expected the file to be a spreadsheet (<code>csv</code> or <code>xlsx</code>).</div>;
        selected = null;
      }
    };
    this.refresh();
  });

  this.addEventListener('click', async (ev) => {
    if (ev.target.tagName === 'BUTTON') {
      const data = new FormData();
      data.append('orders', selected);
      loading = true;
      this.refresh();

      fetch('/api/import-orders', {
        method: 'POST',
        body: data
      })
        .then(async response => {
          if (response.status === 400) {
            throw await response.json();
          };
          return response.json();
        })
        .then(data => {
          console.log(data);
          reset();
          success = data.count; // can't get this result from xlsx so only reads true
          setTimeout(function(){ window.location.reload(); }, 2000);
          this.refresh();
        })
        .catch(err => {
          reset();
          error = <div>Upload failed. { err.error }</div>;
          this.refresh();
        });
    };
  });

  while (true) {
    yield (
      <Fragment>
        <div class="ph1 pv0 tr dib">
          <input type="file" id="order-upload" hidden />
          <label
            for="order-upload"
            class="pointer link dim mid-gray f6 fw6 ttu tracked dib mr3 ba b--mid-gray br2 pa2"
            title="Import Orders">Import Orders</label>
        </div>
        { selected && (
          <div class="dark-gray mv2 pa3 br3 ba b--dark-gray bg-washed-blue">
            { loading ? <BarLoader />  : (
              <Fragment>
                Selected file for import: <span class="code">{ selected.name }</span>.
                <button
                  class="pointer br2 ba b--navy bg-dark-blue white pa2 ml5 mv1 bg-animate hover-bg-navy border-box"
                  name="submit">Import now</button>
              </Fragment>
            )}
          </div>
        )}
        { (success > 0 || success === true) && (
          <div class="dark-gray pa3 mv2 br3 ba b--dark-gray bg-washed-green">
            Successfully imported { Number.isInteger(success) ? success : '' } orders, reloading page.
          </div>
        )}
        { error && (
          <div class="mt5">
            <Error msg={ error } />
          </div>
        )}
      </Fragment>
    );
  };
};

module.exports = UploadOrders;
