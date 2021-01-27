/** @jsx createElement */
import {createElement, Fragment} from '@bikeshaving/crank/cjs';
import {renderer} from '@bikeshaving/crank/cjs/dom';

import Button from '../lib/button';
import TextButton from '../lib/text-button';
import FormModalWrapper from '../wrappers/form-modal';
import Form from '../form';

// class="link dim mid-gray dib mr3 ba b--mid-gray br1 pa2"
const ShowLink = (opts) => {
  const { name, title, color, showModal } = opts;
  return (
    <nav class="ph3 pv2 pv3-ns tr">
      <TextButton color={color} title={title} action={showModal} name={name} />
    </nav>
  );
};

const options = {
  id: 'import-orders', // form id
  title: 'Import Orders',
  color: 'gray',
  src: '/api/import-orders',
  ShowLink: ShowLink,
  saveMsg: 'Upload orders ...',
  successMsg: 'Successfully uploaded orders, reloading page.'
};

function *UploadOrdersModal(props) {

  let { doSave, closeModal, title, formId } = props;

  const findNextWeekday = (day) => {
    // return the date of next Thursday as 14/01/2021 for example
    // Thursday day is 4, Saturday is 6
    let now = new Date();
    now.setDate(now.getDate() + (day + (7-now.getDay())) % 7);
    return now;
  };

  // get these from current boxes??
  const getUpcoming = () => {
    const dates = [4,6].map(el => findNextWeekday(el).toDateString());
    console.log(dates);
    return dates;
  };

  for (const _  of this) {

    const fields = {
      'Orders': {
        id: 'orders',
        size: 'third',
        type: 'file',
        datatype: 'file',
        required: true
      },
      'Delivered': {
        id: 'delivered',
        type: 'select',
        size: 'third',
        datatype: 'string',
        required: true,
        datalist: getUpcoming() // find upcoming days?
      },
    }

    const getInitialData = () => (
      {
        file: null,
        delivered: ''
      }
    );

    yield (
      <Fragment>
        <Form
          data={getInitialData()}
          fields={fields}
          title={title}
          id={formId}
        />
        <div class="w-90 center ph1">
          <Button
            type="primary"
            onclick={ doSave }>
            Upload
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

export default FormModalWrapper(UploadOrdersModal, options);
