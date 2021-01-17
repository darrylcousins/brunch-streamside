/** @jsx createElement */
import {createElement, Fragment} from '@bikeshaving/crank/cjs';
import Fetch from './lib/fetch';
import PackingLists from './partials/packing-lists';

module.exports = function () {
  return (
    <Fragment>
      <PackingLists />
    </Fragment>
  )
};

