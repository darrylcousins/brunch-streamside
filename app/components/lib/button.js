/** @jsx createElement */
import {createElement} from '@bikeshaving/crank/cjs';

module.exports = (props) => {
  const { children, type } = props;
  let classList;
  if (type === 'secondary') {
      classList = 'b--navy bg-near-white navy hover-bg-moon-gray';
  } else {
      classList = 'b--navy bg-dark-blue white hover-bg-navy';
  }
  if (!props.hasOwnProperty('title') && typeof children === 'string') {
    props.title = children;
  }
  return (
    <button
      { ...props }
      type="button"
      class={ `pointer br2 ba pa2 ml1 mv1 bg-animate border-box ${classList }` }>
      { children }
    </button>
  );
};

