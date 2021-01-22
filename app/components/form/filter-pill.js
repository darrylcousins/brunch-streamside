/** @jsx createElement */
import {createElement, Fragment} from '@bikeshaving/crank/cjs';

function *FilterPill({name, type, callback}) {

  this.addEventListener('click', (ev) => {
    callback(name, type);
  });

  while (true) (
    yield ( 
      <span class="ba pv1 ph2 ml2 br2 f6 bg-black-10 dim pointer">{ name } &#x2716;</span>
    )
  )
}

module.exports = FilterPill;

