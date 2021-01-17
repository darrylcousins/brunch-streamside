/** @jsx createElement */
import {createElement, Fragment} from '@bikeshaving/crank/cjs';
import FieldWrapper from './field-wrapper';

const TextField = (props) => {
  const {
    label,
    id,
    size,
    valid,
    onblur,
    onfocus
  } = props;
  return (
    <FieldWrapper label={label} size={size} id={id}>
      <input 
        class={ `mr1 pa2 ba bg-transparent hover-bg-near-white w-100 input-reset br2 ${ 
          !valid ? 'invalid' : '' 
        }` }
        { ...props }
      />
      <span class={ `small mt1 fg-streamside-orange ${ valid && 'hidden' }` }>
        Field is required
      </span>&nbsp;
    </FieldWrapper>
  )
}

module.exports = TextField;
