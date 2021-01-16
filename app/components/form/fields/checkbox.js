/** @jsx createElement */
import {createElement, Fragment} from '@bikeshaving/crank/cjs';
import FieldWrapper from './field-wrapper';

/*
        value={ value }
        name={ id }
        label={ label }
        id={ id }
        size={ size }
        required={ required }
        valid={ valid }
        datetype={ datatype }
  */
const Checkbox = (props) => {
  const { label, valid, size, id, value, datatype } = props;
  return (
    <FieldWrapper label={label} size={size} id={id}>
      <input 
        class={ `mr1 pa2 ba bg-transparent hover-bg-near-white br2 db ${ 
          !valid ? 'invalid' : '' 
        }` }
        type="checkbox"
        checked={ value }
        id={ id }
        name={ name }
        datatype={ datatype }
      />
    </FieldWrapper>
  )
}

module.exports = Checkbox;
