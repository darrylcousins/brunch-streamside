/** @jsx createElement */
import {createElement} from '@bikeshaving/crank/cjs';

module.exports = ({msg}) => {
  if (typeof msg === 'String') {
    return (
      <div class="dark-red pt2 pl2 br3 ba b--dark-red bg-washed-red">
        <p class="tc">{msg}</p>
      </div>
    );
  } else {
    return (
      <div class="dark-red pt2 pl2 br3 ba b--dark-red bg-washed-red">
        <p class="tc">{msg.msg}</p>
        <p class="tc">{msg.err}</p>
      </div>
    );
  }
};


