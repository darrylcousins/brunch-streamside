/** @jsx createElement */
import { createElement, Fragment } from '@bikeshaving/crank/cjs';
import BarLoader from '../lib/bar-loader';
import Error from '../lib/error';
import { Fetch } from '../lib/fetch';
import { DownloadIcon } from '../lib/icon';
import { sortObjectByKey, sortObjectByKeys } from './lib';
import IconButton from '../lib/icon-button';

function *PackingLists() {
  let fetchJson = null;
  let fetchDates = Array();
  let fetchError = null;
  let selectedDate = null;
  let loading = true;

  const isBread = (str) => Boolean(str.match(/bread|bellbird|sourdough/gi));
  const isFruit = (str) => Boolean(str.match(/apple/gi));

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
    const src = `/api/packing-list/${ new Date(Date.parse(date)).getTime() }`;
    loading = true;
    selectedDate = date;
    this.refresh();
    Fetch(src)
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
  };

  this.addEventListener("click", async (ev) => {
    const name = ev.target.tagName;
    if (ev.target.tagName === 'H2' ) {
      const src = ev.target.innerHTML;
      loadSources(src);
    };
  });

  const Includes = ({ including }) => {
    return (
      <Fragment>
        <h4>Included box products</h4>
        { including.map(product => (
          <span class="db">{ product.replace(/^- /, '') }</span>
        ))}
      </Fragment>
    )
  };

  const Extras = ({ extras }) => {
    return (
      <Fragment>
        <h4>Extra box products</h4>
        { Object.keys(extras).map(key => (
          <div class="dt dt--fixed">
            <div class="dtc">
              <span class="db">{ key }</span>
            </div>
            <div class="dtc">
              <span class="db">{ extras[key] }</span>
            </div>
          </div>
        ))}
      </Fragment>
    )
  };

  const sortByBox = (list) => {
    list.sort((a, b) => (a.box > b.box) ? 1 : -1);
    return list;
  };

  const sortByProducts = (pickingList) => {
    const final = Array();
    const pickingKeys = Object.keys(pickingList);
    const fruit = pickingKeys.filter(el => isFruit(el)).sort();
    const bread = pickingKeys.filter(el => isBread(el)).sort();
    const vege = pickingKeys
      .filter(item => ![...fruit, ...bread].includes(item)).sort();
    bread.forEach(key => final.push(key));
    fruit.forEach(key => final.push(key));
    vege.forEach(key => final.push(key));
    return final;
  };

  while (true) {
    yield (
      <div class="f6 w-100 mt2 pb2 center">
        <h2 class="pt0 f5 f4-ns lh-title-ns">Picking and packing lists</h2>
        { fetchError && <Error msg={fetchError} /> }
        { fetchDates && (selectedDate === null) && (
          <span class="db lh-copy mb2 f5">Select delivery date:</span>
        )}
        { fetchDates && (
          <div class="tabs center">
            <div class="tabs__menu dt dt--fixed mb2 bb b--black-20">
              { fetchDates.map((el, index) => (
                <label 
                  for={ el.replace(/ /g, '-') }
                  class="tabs__menu-item dtc tc bg-white pt1 pb2 bg-animate hover-bg-near-white pointer">
                  <h2
                    class={ `mv0 f6 f5-ns lh-title-ns ttu tracked ${ (selectedDate !== el) && 'o-40' } ${ (selectedDate === el) && 'dark-green' }` }
                    id={ el.replace(/ /g, '-') + '-key' }
                    name="tabs">
                    { el }
                  </h2>
                </label>
              ))}
            </div>
          </div>
        )}
        { fetchJson && Object.keys(fetchJson.picking).length && (
          <Fragment>
            <h3 class="pt2">
              Picking list for { selectedDate } - {fetchJson.total_boxes} boxes
              <a
                class="no-underline dark-green dim"
                href={ `/api/picking-list-download/${ new Date(selectedDate).getTime() }` }
                title="Download as xlsx">
                <DownloadIcon />
                <span class="dn">Download picking list</span>
              </a>
            </h3>
            <table class="f6 w-100 center" cellspacing="0">
              <thead>
                <tr>
                  <th class="fw6 bb b--black-20 tl pb3 ph1 bg-white">
                    Product
                  </th>
                  <th class="fw6 bb b--black-20 tl pb3 ph1 bg-white">
                    Standard box count
                  </th>
                  <th class="fw6 bb b--black-20 tl pb3 ph1 bg-white">
                    Extras count
                  </th>
                  <th class="fw6 bb b--black-20 tl pb3 ph1 bg-white">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                { sortByProducts(fetchJson.picking).map(key => (
                    <tr crank-key={key} class="striped--near-white">
                      <td class="pv1 ph1 bb b--black-20 v-top">
                        { key }
                      </td>
                      <td class="pv1 ph1 bb b--black-20 v-top">
                          { fetchJson.picking[key].standard }
                      </td>
                      <td class="pv1 ph1 bb b--black-20 v-top">
                          { fetchJson.picking[key].extras }
                      </td>
                      <td class="pv1 ph1 bb b--black-20 v-top">
                          { fetchJson.picking[key].total }
                      </td>
                    </tr>
                ))}
              </tbody>
            </table>
          </Fragment>
        )}
        { fetchJson &&  (
          <h3 class="pt2">
            Packing list for { selectedDate } - {fetchJson.total_boxes} boxes
            <a
              class="no-underline dark-green dim"
              href={ `/api/packing-list-download/${ new Date(selectedDate).getTime() }` }
              title="Download as xlsx">
              <DownloadIcon />
              <span class="dn">Download packing list</span>
            </a>
          </h3>
        )}
        { fetchJson && sortByBox(fetchJson.boxes).map(el => (
          <Fragment>
            <h3 class="bt b--dark-gray pt2">{ el.box } <small class="">Order count: { el.order_count }</small></h3>
            
            <div class="dt-ns dt--fixed-ns">
              <div class="dtc-ns">
                <Includes including={ el.including } />
              </div>
              <div class="dtc-ns">
                <Extras extras={ el.extras } />
              </div>
            </div>
          </Fragment>
        ))}
        { loading && <BarLoader /> }
      </div>
    );
  };
};

module.exports = PackingLists;


