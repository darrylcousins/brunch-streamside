/** @jsx createElement */
import {createElement, Fragment} from '@bikeshaving/crank/cjs';

import FormModalWrapper from '../wrappers/form-modal';
import UpsertTodoModal from './todo-upsert';

const ShowLink = (opts) => {
  const { name, title, color, showModal } = opts;
  return (
    <nav class="f6 fw6 ttu tracked ph3 pv2 pv3-ns tr">
      <a
        class="link dim mid-gray dib mr3 ba b--mid-gray br1 pa2"
        onclick={ showModal }
        href="#"
        title={ title }>{ title }</a>
    </nav>
  );
};

// this is all that we need to make a form modal
// edit src is 'api/update-todo
const options = {
  id: 'add-todo', // form id
  title: 'Add Todo', // titles
  color: 'navy', // icon/link color
  src: '/api/add-todo', // where PostFetch sends data to
  ShowLink: ShowLink, // Element, button or link to open modal
  saveMsg: 'Updating todo ...', // message on saving
  successMsg: 'Successfully updated todo, reloading page.' // message on success
};

module.exports = FormModalWrapper(UpsertTodoModal, options);

