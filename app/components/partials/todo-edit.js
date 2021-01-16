/** @jsx createElement */
import {createElement, Fragment} from '@bikeshaving/crank/cjs';

import FormModalWrapper from '../wrappers/form-modal';
import UpsertTodoModal from './todo-upsert';
import { EditIcon } from '../lib/icon';

const ShowLink = (opts) => {
  const { name, title, color, showModal } = opts;
  return (
    <a
      class="pointer no-underline navy dib dim"
      name="open"
      title="Edit Todo">
      <EditIcon />
      <span class="dn">Edit Todo</span>
    </a>
  );
};

// this is all that we need to make a form modal
// edit src is 'api/update-todo
const options = {
  id: 'edit-todo', // form id
  title: 'Edit Todo', // titles
  color: 'navy', // icon/link color
  src: '/api/edit-todo', // where PostFetch sends data to
  ShowLink: ShowLink, // Element, button or link to open modal
  saveMsg: 'Updating todo ...', // message on saving
  successMsg: 'Successfully updated todo, reloading page.' // message on success
};

module.exports = FormModalWrapper(UpsertTodoModal, options);

