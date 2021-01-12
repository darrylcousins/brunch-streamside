/** @jsx createElement */
import {createElement, Fragment} from '@bikeshaving/crank/cjs';
import BarLoader from '../lib/bar-loader';
import Error from '../lib/error';
import { Fetch } from '../lib/fetch';
import {
  DownloadIcon,
  DeleteIcon,
  AddIcon,
  HelpIcon,
  CloseIcon,
  EditIcon
} from '../lib/icon';
import Button from '../lib/button';

let weekday=new Array(7);
weekday[0]="Sunday";
weekday[1]="Monday";
weekday[2]="Tuesday";
weekday[3]="Wednesday";
weekday[4]="Thursday";
weekday[5]="Friday";
weekday[6]="Saturday";

function *AddModal({ delivered, index }) {
  let visible = false;
  let loading = true;
  let fetchError = null;
  let fetchFormFields =[];
  const key = delivered.replace(/ /g, '-').toLowerCase();

  const closeModal = () => {
    visible = false;
    this.refresh();
  };

  this.addEventListener("click", async (ev) => {
    const name = ev.target.tagName.toUpperCase();
    if (name === "SVG" || name === 'PATH') {
      visible = !visible;
      this.refresh();
    };
  });

  while (true) {
    yield (
      <Fragment>
        <a
          name={ delivered.replace(/ /g, '-') + '-key' }
          class={ `no-underline navy dim ${ (parseInt(index) !== 0 && !active) ? 'dn' : 'dib'}` }
          href="#"
          title="Add Box">
          <AddIcon />
        </a>
        { visible && (
          <div class="db absolute left-0 w-100 h-100 z-1 bg-black-90 pa4"
               style={ `top: ${ Math.round(window.scrollY).toString() }px; cursor: default` }>
            <div class="bg-white pa4 br3">
              <a
                class="no-underline mid-gray dim o-70 absolute top-1 right-1"
                name="close"
                onclick={ closeModal }
                href="#"
                style="margin-right: 30px; margin-top: 30px;"
                title="Close add modal">
                <CloseIcon />
                <span class="dn">Close info</span>
              </a>
              { fetchError && <Error msg={fetchError} /> }
              <h2 class="fw4">Adding box for '{ delivered }'.</h2>
            </div>
          </div>
        )}
      </Fragment>
    )
  };
};

const Box = ({box, index}) => {
  const deliveryDate = new Date(box.delivered);
  return (
    <tr key={index}>
      <td class="pv3 pr3 bb b--black-20 blue">
        { deliveryDate.toLocaleDateString() }
        <br />
        ({ weekday[deliveryDate.getDay()] })
      </td>
      <td class="pv3 pr3 bb b--black-20">
        <strong>{ box.shopify_title }</strong>
        <br />
        <span class="f6">({ box.shopify_handle })</span>
      </td>
      <td class="pv3 pr3 bb b--black-20 rh-copy blue">${ parseFloat(box.shopify_price/100).toFixed(2) }</td>
    </tr>
  );
};

const Boxes = ({boxes}) => {
  return (
    <div class="overflow-auto">
      { Object.keys(boxes).length > 0 && (
        <div class="tabs center">
          <div class="tabs__menu dt dt--fixed mb2 bb b--black-20">
            { Object.keys(boxes).map((key, index) => (
              <label 
                for={ key.replace(' ', '-') }
                class="tabs__menu-item dtc tc bg-white pt1 pb2 bg-animate hover-bg-near-white pointer">
                <h2
                  class={ `mv0 f6 f5-ns lh-title-ns ttu tracked ${ (index !== 0) && 'o-40' } ${ (index === 0) && 'dark-green' }` }
                  name="tabs">
                  { key }
                </h2>
              </label>
            ))}
          </div>
          <div class="tabs__content">
            { Object.keys(boxes).map((key, index) => (
              <div>
                <input type="radio" class="dn" name="sections"
                  id={ key.replace(' ', '-') } checked={ (index === 0) } />
                <div class="tabs__content__info">
                  <table class="f6 w-100 center" cellspacing="0">
                    <thead>
                      <tr>
                        <th class="fw6 bb b--black-20 tl pb3 pr3 bg-white">Delivery Date</th>
                        <th class="fw6 bb b--black-20 tl pb3 pr3 bg-white">Title</th>
                        <th class="fw6 bb b--black-20 tl pb3 pr3 bg-white">Price</th>
                      </tr>
                    </thead>
                    <tbody class="lh-copy">
                      { 
                        boxes[key].map((box, index) => (
                          <Box key={index} box={box} />
                        ))
                      }
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    }
    </div>
  )
};

function *CurrentBoxes() {
  let fetchJson = Array();
  let fetchError = null;
  let loading = true;

  Fetch(`/api/current-boxes`)
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
    yield (
      <div class="f6 w-100 mt2 pb2 center">
        <h2 class="pt0 f5 f4-ns lh-title-ns">Current Boxes</h2>
        { fetchError && <Error msg={fetchError} /> }
        <AddModal delivered="Thu 14 Jan 2010" index="0" />
        { Object.keys(fetchJson).length > 0 ? (
          <Boxes boxes={fetchJson} />
        ) : (
          <p class="lh-copy">Nothing to see here as yet.</p>
        )}
        <span>{ Object.keys(fetchJson).length > 0 }</span>
        { loading && <BarLoader /> }
      </div>
    );
  };
};

module.exports = CurrentBoxes;
