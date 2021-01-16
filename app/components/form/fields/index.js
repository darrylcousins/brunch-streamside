/** @jsx createElement */
import {createElement, Fragment} from '@bikeshaving/crank/cjs';

import Checkbox from './checkbox';
import TextField from './text';
import TextArea from './textarea';
import Hidden from './hidden';
import Select from './select';
import Multiple from './multiple';

function Field(props) {

  let { label, options, data, formElements} = props;
  let { id, type, size, required, datalist, datatype } = options;

  if (typeof id === 'undefined') {
    id = label.toLowerCase().replace(/ /g, '-');
  }
  const value = data[id]; // can be expected as undefined

  let valid = true;
  if (formElements.hasOwnProperty(id)) {
    valid = formElements[id].checkValidity();
  };

  // sould then be event listeners??
  const onFocus = (ev) => {
    const el = ev.target;
    el.classList.remove('invalid');
    el.nextSibling.innerHTML = '';
    el.nextSibling.classList.add('hidden');
  };

  const onBlur = (ev) => {
    const el = ev.target;
    if (!el.checkValidity()) {
      el.classList.add('invalid');
      el.nextSibling.innerHTML = el.validationMessage;
      el.nextSibling.classList.remove('hidden');
    };
  };

  const CommaInfo = () => {
    return <small class="f7 fw3">{ `(comma separated)` }</small>;
  };

  const checkArray = ['select', 'multiple'];

  if (type === 'hidden') {
    return (
      <Hidden
        value={ value }
        name={ id }
        type={ type }
        id={ id }
        datatype={ datatype }
      />
    )
  }

  if (type === 'textarea') {
    return (
      <TextArea
        value={ value }
        name={ id }
        label={ label }
        id={ id }
        size={ size }
        required={ required }
        valid={ valid }
        onfocus={ onFocus } // addEventListener???
        onblur={ onBlur }
        datatype={ datatype }
      />
    )
  }

  if (type === 'text') {
    return (
      <TextField
        value={ value }
        name={ id }
        label={ label }
        id={ id }
        size={ size }
        required={ required }
        valid={ valid }
        onfocus={ onFocus } // addEventListener???
        onblur={ onBlur }
        datatype={ datatype }
        type={ type }
      />
    )
  }

  if (type === 'checkbox') {
    return (
      <Checkbox
        value={ value }
        name={ id }
        label={ label }
        id={ id }
        size={ size }
        required={ required }
        valid={ valid }
        datatype={ datatype }
      />
    )
  }

  if (type === 'select') {
    return (
      <Select
        value={ value }
        name={ id }
        label={ label }
        id={ id }
        size={ size }
        type={ type }
        required={ required }
        valid={ valid }
        onfocus={ onFocus } // addEventListener???
        onblur={ onBlur }
        datalist={ datalist }
        datatype={ datatype }
      />
    )
  }

  if (type === 'multiple') {
    return (
      <Multiple
        value={ value }
        name={ id }
        label={ label }
        id={ id }
        type={ type }
        size={ size }
        required={ required }
        valid={ valid }
        onfocus={ onFocus } // addEventListener???
        onblur={ onBlur }
        datalist={ datalist }
        datatype={ datatype }
      />
    )
  }

  return <div>Faild to find input element to render</div>
};

module.exports = Field;
