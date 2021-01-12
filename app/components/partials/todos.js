/** @jsx createElement */
import {createElement, Fragment} from '@bikeshaving/crank/cjs';

import BarLoader from '../lib/bar-loader';
import Error from '../lib/error';
import { Fetch } from '../lib/fetch';
import {
  AddIcon,
  CloseIcon,
  EditIcon
} from '../lib/icon';
import Button from '../lib/button';

function *CurrentTodos() {
  let fetchJson = Array();
  let fetchError = null;
  let loading = true;

  Fetch(`/api/current-todos`)
    .then(result => {
      const { error, json } = result;
      if (error !== null) {
        fetchError = error;
        loading = false;
        this.refresh();
      } else {
        fetchJson = json;
        loading = false;
        this.refresh();
      };
    })
    .catch(err => {
      fetchError = err;
      loading = false;
      this.refresh();
    });

  while (true) {
    console.log('fetch json:', fetchJson);
    yield (
      <div class="">
        <h2 class="pt0 f5 f4-ns lh-title-ns ma0 fg-streamside-maroon">Todos</h2>
        { fetchError && <Error msg={fetchError} /> }
        { fetchJson.length > 0 ? (
          <Fragment>
            { 
              fetchJson.map((todo, index) => (
                <article class="br2 ba dark-gray b--black-10 mv4 w-100 w-50-ns mw9 center">
                  <div class="pa2 ph3-ns pb3-ns">
                    <div class="dt w-100 mt1">
                      <div class="dtc">
                        <h1 class="f5 f4-ns mv0">{ todo.title }</h1>
                      </div>
                      <div class="dtc tr">
                        <h2 class="f5 mv0"><small class="fw3 ttu tracked fg-streamside-orange">{ todo.author }</small></h2>
                        <h2 class="f5 mv0"><small class="fw3 ttu tracked fg-streamside-maroon">{ todo.created }</small></h2>
                        <h2 class="f5 mv0"><small class="fw3 ttu tracked fg-streamside-blue">{ todo.label }</small></h2>
                      </div>
                    </div>
                    <p class="f6 lh-copy measure mt2 mid-gray">
                      { todo.note }
                    </p>
                  </div>
                </article>
              ))
            }
          </Fragment>
        ) : (
          <p class="lh-copy">Nothing to see here as yet.</p>
        )}
        { loading && <BarLoader /> }
      </div>
    );
  };
};

module.exports = CurrentTodos;

