/** @jsx createElement */
import {createElement, Fragment} from '@bikeshaving/crank/cjs';
import {renderer} from '@bikeshaving/crank/cjs/dom';

import { RemoveIcon } from '../lib/icon';
import Button from '../lib/button';
import FormModalWrapper from '../wrappers/form-modal';
import Form from '../form';

const ShowLink = (opts) => {
  const { name, title, color } = opts;
  return (
    <a
      class={ `pointer no-underline ${color} dib dim` }
      name={ name }
      title={ title }>
      <RemoveIcon />
      <span class="dn">{ title }</span>
    </a>
  );
};

const options = {
  id: 'remove-todo', // form id
  title: 'Remove Todo',
  color: 'dark-red',
  src: '/api/remove-todo',
  ShowLink: ShowLink,
  saveMsg: 'Removing todo ...',
  successMsg: 'Successfully removed todo, reloading page.'
};

function *RemoveTodoModal(props) {

  let { doSave, closeModal, title, todo, formId } = props;

  for (const _  of this) {

    const fields = {
      '_id': {
        type: 'hidden',
        datatype: 'integer'
      },
    }

    const getInitialData = () => ({ _id: todo._id });

    yield (
      <Fragment>
        <p class="lh-copy tl">
          Are you sure you want to remove <b>{ todo.title }</b>?
        </p>
        <Form
          data={getInitialData()}
          fields={fields}
          title={title}
          id={formId}
        />
        <div class="w-90 center ph1">
          <Button
            onclick={ doSave }>
            Remove
          </Button>
          <Button
            onclick={ closeModal }>
            Cancel
          </Button>
        </div>
      </Fragment>
    );
  }

};

module.exports = FormModalWrapper(RemoveTodoModal, options);
