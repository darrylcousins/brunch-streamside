/** @jsx createElement */
import {createElement, Fragment} from '@bikeshaving/crank/cjs';
import {renderer} from '@bikeshaving/crank/cjs/dom';

import { AddIcon } from '../lib/icon';
import FormModalWrapper from '../wrappers/form-modal';
import UpsertOrderModal from './order-upsert';

const ShowLink = (opts) => {
  const { name, title, color } = opts;
  return (
    <a
      class={ `pointer no-underline ${color} dib dim` }
      name={ name }
      title={ title }>
      <AddIcon />
      <span class="dn">{ title }</span>
    </a>
  );
};

const options = {
  id: 'add-order', // form id
  title: 'Add Order',
  color: 'navy',
  src: '/api/add-order',
  ShowLink: ShowLink,
  saveMsg: 'Saving order ...',
  successMsg: 'Successfully saved order, reloading page.'
};

module.exports = FormModalWrapper(UpsertOrderModal, options);
