/** @jsx createElement */
import {createElement, Fragment} from '@bikeshaving/crank/cjs';

const Hidden = (props) => {
  const { datatype } = props;
  return (
    <input
      { ...props }
    />
  )
}

module.exports = Hidden;
//<input
//     id={id}
//     name={id}
//     datatype={datatype}
//     type="hidden"
//     value={value}
//     { ...props }
//   />
