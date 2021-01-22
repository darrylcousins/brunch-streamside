/** @jsx createElement */
import {createElement, Fragment} from '@bikeshaving/crank/cjs';

function *FilterSelect({name, fields, position, type, callback}) {

  let borders = 'ba';
  if (position === 'left') borders = 'bt bb bl br-0 br--left';
  if (position === 'center') borders = 'ba br--left br--right';
  if (position === 'right') borders = 'bt bb br bl-0 br--right';
  if (position === 'single') borders = 'ba';

  this.addEventListener('change', (ev) => {
    callback(ev.target.value, type);
    ev.target.value = fields[0];
  });

  while (true) (
    yield ( 
      <select 
        class={ `pa1 bg-transparent hover-bg-near-white dib ${borders} br2 b--mid-gray mid-gray` }
        id={ name }
        name={ name }
      >
        { fields.map(el => (
          <option value={ el }>{ el }</option>
        ))}
      </select>
    )
  )
}

module.exports = FilterSelect;

