/** @jsx createElement */
import {createElement, Fragment} from '@bikeshaving/crank/cjs';

import Button from '../lib/button';
import Form from '../form';

function *UpsertOrderModal(props) {
  // and this is all that we need to make a form modal

  let { doSave, closeModal, title, order, delivered, formId, index } = props;

  const findNextWeekday = (day) => {
    // return the date of next Thursday as 14/01/2021 for example
    // Thursday day is 4, Saturday is 6
    let now = new Date();
    now.setDate(now.getDate() + (day + (7-now.getDay())) % 7);
    return now;
  };

  const getUpcoming = () => {
    const dates = [4,6].map(el => findNextWeekday(el).toDateString());
    dates.unshift(delivered);
    //console.log(dates);
    return dates;
  };

  for (const _  of this) {

    // form fields - required
    const fields = {
      '_id': {
        id: '_id',
        type: 'hidden',
        datatype: 'integer'
      },
      'Name': {
        id: 'name', // compiled from first and last
        type: 'hidden',
        datatype: 'string',
      },
      'Order Number': {
        id: 'order_number',
        type: 'hidden',
        datatype: 'string',
      },
      'Price': {
        id: 'subtotal_price',
        type: 'hidden',
        datatype: 'string',
      },
      'Including': {
        id: 'including',
        type: 'hidden',
        datatype: 'array',
      },
      'First Name': {
        id: 'first_name',
        type: 'text',
        size: '25',
        datatype: 'string',
        required: true
      },
      'Last Name': {
        id: 'last_name',
        type: 'text',
        size: '25',
        datatype: 'string',
        required: true
      },
      'Telephone': {
        id: 'phone',
        type: 'text',
        size: '25',
        datatype: 'string',
        required: true
      },
      'Street Address': {
        id: 'address1',
        type: 'text',
        size: '25',
        datatype: 'string',
        required: true
      },
      'Suburb': {
        id: 'address2',
        type: 'text',
        size: '25',
        datatype: 'string',
        required: false
      },
      'City': {
        id: 'city',
        type: 'text',
        size: '25',
        datatype: 'string',
        required: true
      },
      'Postcode': {
        id: 'zip',
        type: 'text',
        size: '25',
        datatype: 'string',
        required: true
      },
      'Email': {
        id: 'contact_email',
        type: 'text',
        size: '25',
        datatype: 'string',
        required: true
      },
      'Box': {
        id: 'sku',
        type: 'text',
        size: 'third',
        datatype: 'string',
        required: true
      },
      'Source': {
        id: 'source',
        type: 'text',
        size: 'third',
        datatype: 'string',
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
      'Extras': {
        id: 'addons',
        type: 'text',
        size: '100',
        datatype: 'array',
        required: false
      },
      'Excluding': {
        id: 'removed',
        type: 'text',
        size: '100',
        datatype: 'array',
        required: false
      },
      'Delivery Note': {
        id: 'note',
        type: 'textarea',
        size: '100',
        datatype: 'string',
        required: false
      },
    };

    // datalists - optional for 'select' input elements
    // required - initialize form data
    const getInitialData = () => {
      if (typeof order !== 'undefined') {
        return order;
      } else {
        const result = Object();
        for (const [key, value] of Object.entries(fields)) {
          result[value['id']] = '';
        }
        result['delivered'] = delivered;
        result['_id'] = new Date().getTime();
        return result;
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

module.exports = UpsertOrderModal;

