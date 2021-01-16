/** @jsx createElement */
import {createElement, Fragment} from '@bikeshaving/crank/cjs';

import FormModalWrapper from '../wrappers/form-modal';
import UpsertOrderModal from './order-upsert';
import { EditIcon } from '../lib/icon';

const ShowLink = (opts) => {
  const { name, title, color, showModal } = opts;
  return (
    <a
      class="pointer no-underline navy dib dim"
      name="open"
      title={ title }>
      <EditIcon />
      <span class="dn">{ title }</span>
    </a>
  );
};

// this is all that we need to make a form modal
// edit src is 'api/update-todo
const options = {
  id: 'edit-order', // form id
  title: 'Edit Order', // titles
  color: 'navy', // icon/link color
  src: '/api/edit-order', // where PostFetch sends data to
  ShowLink: ShowLink, // Element, button or link to open modal
  saveMsg: 'Updating order ...', // message on saving
  successMsg: 'Successfully updated order, reloading page.' // message on success
};

module.exports = FormModalWrapper(UpsertOrderModal, options);

