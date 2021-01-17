/** @jsx createElement */
import {createElement, Fragment} from '@bikeshaving/crank/cjs';
import BarLoader from '../lib/bar-loader';
import Error from '../lib/error';
import { Fetch } from '../lib/fetch';
import { Boxes } from './boxes-lib';

function *PackingLists() {
  let fetchJson = Array();
  let fetchDates = Array();
  let fetchError = null;
  let loading = true;

  Fetch(`/api/current-box-dates`)
    .then(result => {
      const { error, json } = result;
      if (error !== null) {
        fetchError = error;
        loading = false;
        this.refresh();
      } else {
        fetchDates = json;
        loading = false;
        this.refresh();
      };
    })
    .catch(err => {
      fetchError = err;
      loading = false;
      this.refresh();
    });

  const loadSources = (date) => {
    console.log(date);
    const src = `/api/packing-list/${ new Date(Date.parse(date)).getTime() }`;
    console.log(src);
  };

  this.addEventListener('click', (ev) => {
    if (ev.target.tagName === 'SPAN' && ev.target.getAttribute('name') === 'delivered') {
      loadSources(ev.target.innerHTML);
    }
  });

  while (true) {
    yield (
      <div class="f6 w-100 mt2 pb2 center">
        <h2 class="pt0 f5 f4-ns lh-title-ns">Picking and packing lists</h2>
        { fetchError && <Error msg={fetchError} /> }
        { fetchDates && (
          <span class="db lh-copy mb2 f5">Select delivery date:</span>
        )}
        { fetchDates.map(el => (
          <span
            class="db pointer mb1 dim"
            id={ el.replace(/ /g, '-') }
            name="delivered"
          >{ el }</span>
        ))}
        { loading && <BarLoader /> }
      </div>
    );
  };
};

module.exports = PackingLists;


