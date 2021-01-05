/** @jsx createElement */
import {createElement} from '@bikeshaving/crank/cjs';

module.exports = (props) => {
  const { children } = props;
  return (
    <button
      { ...props }
      type="button"
      class="pointer br2 ba b--navy bg-dark-blue white pa2 ml1 mv1 bg-animate hover-bg-navy border-box">
      { children }
    </button>
  );
};

