/** @jsx createElement */
import {createElement} from '@bikeshaving/crank/cjs';

module.exports = ({msg}) => {
  console.log(msg, typeof msg);
  if (typeof msg === 'string') {
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


