/** @jsx createElement */
import {createElement, Fragment} from '@bikeshaving/crank/cjs';

import Button from '../lib/button';
import Form from '../form';

function *UpsertTodoModal(props) {
  // and this is all that we need to make a form modal

  let { doSave, closeModal, title, todo, formId } = props;

  for (const _  of this) {

    // form fields - required
    const fields = {
      '_id': {
        type: 'hidden',
        datatype: 'integer'
      },
      'Title': {
        type: 'text',
        size: 'third',
        datatype: 'string',
        required: true
      },
      'Author': {
        type: 'select',
        size: 'third',
        required: true,
        datatype: 'string',
        datalist: [
          'Lilly', 'Dominique', 'Darryl'
        ]
      },
      'Tags': {
        type: 'multiple',
        size: 'third',
        required: true,
        datatype: 'array',
        datalist: [
          'Bug',
          'Urgent',
          'Enhancement',
          'WontFix',
          'NiceToHave',
          'Orders',
          'Boxes'
        ]
      },
      'Note': {
        type: 'textarea',
        size: 'two-thirds',
        datatype: 'string',
        required: true
      },
      'Completed': {
        type: 'checkbox',
        datatype: 'string',
        size: 'third'
      },
      'Created': {
        datatype: 'string',
        type: 'hidden'
      }
    };

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
            onclick={ doSave }>
            Save
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

module.exports = UpsertTodoModal;

