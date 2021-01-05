/** @jsx createElement */
import {createElement, Fragment} from '@bikeshaving/crank/cjs';
import Fetch from './lib/fetch';
import CurrentBoxes from './partials/boxes';

module.exports = function () {
  return (
    <Fragment>
      <nav class="f6 fw6 ttu tracked ph3 pv2 pv3-ns tr">
        <a class="link dim near-black dib mr3" href="#" title="Add box">Add box</a>
        <a class="link dim near-black dib mr3" href="#" title="Duplicate box">Duplicate box</a>
      </nav>
      <CurrentBoxes />
    </Fragment>
  )
};


