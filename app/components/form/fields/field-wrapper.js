/** @jsx createElement */
import {createElement} from '@bikeshaving/crank/cjs';

const FieldWrapper = (props) => {
  const { children, label, size, id } = props;
  return (
    <div class={ `fl w-100 w-${ size }-ns` }>
      <div class="tl ph2 mt1 ml0">
        <label class="fw6 lh-copy f6" for={ id }>
          { label }
        </label>
        { children }
      </div>
    </div>
  )
}

module.exports = FieldWrapper;
