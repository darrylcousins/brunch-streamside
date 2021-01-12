/** @jsx createElement */
import {createElement} from '@bikeshaving/crank/cjs';

const Bar = () => (
  <div class="load-bar">
    <div class="bar"></div>
    <div class="bar"></div>
    <div class="bar"></div>
  </div>
);

module.exports = () => (
  <div class="progress-bar mt2">
    <span class="bar">
      <span class="progress"></span>
    </span>
  </div>
);


