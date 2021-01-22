/** @jsx createElement */
import {createElement, Fragment} from '@bikeshaving/crank/cjs';

import Button from '../lib/button';
import Form from '../form';
import fields from './todo-fields';

function *UpsertTodoModal(props) {
  // and this is all that we need to make a form modal

  let { doSave, closeModal, title, todo, formId } = props;

  for (const _  of this) {

    // form fields - required - see import

    // datalists - optional for 'select' input elements
    // required - initialize form data
    const getInitialData = () => {
      if (typeof todo !== 'undefined') {
        return todo;
      } else {
        const now = new Date();
        return {
          _id: now.getTime(),
          title: '',
          tags: '',
          note: '',
          author: '',
          created: now.toDateString(),
          completed: false
        }
      }
    };

    yield (
      <Fragment>
        <div class="w-90 center ph1">
          <Form
            data={getInitialData()}
            fields={fields}
            title={title}
            id={formId}
          />
          <Button
            type="primary"
            onclick={ doSave }>
            Save
          </Button>
          <Button
            type="secondary"
            onclick={ closeModal }>
            Cancel
          </Button>
        </div>
      </Fragment>
    );
  }
};

module.exports = UpsertTodoModal;

