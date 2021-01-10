/** @jsx createElement */
import {createElement, isElement} from '@bikeshaving/crank/cjs';

module.exports = ({msg}) => {
  console.log(msg, typeof msg, isElement(msg));
  if (typeof msg === 'string' || isElement(msg)) {
    return (
      <div class="dark-red mv2 pt2 pl2 br3 ba b--dark-red bg-washed-red">
        <p class="tc">{msg}</p>
      </div>
    );
  } else {
    return (
      <div class="dark-red mv2 pt2 pl2 br3 ba b--dark-red bg-washed-red">
        <p class="tc">{msg.msg}</p>
        <p class="tc">{msg.err}</p>
      </div>
    );
  }
};


