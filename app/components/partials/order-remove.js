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
  id: 'remove-order', // form id
  title: 'Remove Order',
  color: 'dark-red',
  src: '/api/remove-order',
  ShowLink: ShowLink,
  saveMsg: 'Removing order ...',
  successMsg: 'Successfully removed order, reloading page.'
};

function *RemoveOrderModal(props) {

  let { doSave, closeModal, title, order, formId } = props;

  for (const _  of this) {

    const fields = {
      '_id': {
        type: 'hidden',
        datatype: 'integer'
      },
    }

    const getInitialData = () => ({ _id: order._id });

    yield (
      <Fragment>
        <p class="lh-copy tl">
          Are you sure you want to remove <b>{ order.sku }</b> for <b>{ order.contact_email }</b> from <b>{ order.source }</b>?
        </p>
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
            Remove
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

module.exports = FormModalWrapper(RemoveOrderModal, options);
