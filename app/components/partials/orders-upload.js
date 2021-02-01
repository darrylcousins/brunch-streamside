/** @jsx createElement */
/**
 * Creates element to render a modal form for uploading orders from other sources. This
 * component sets up the form fields and initial data to render a {@link
 * module:app/form/form~Form|Form}. Essential options for the form are a
 * dictionary of fields and initialData.
 *
 * @module app/components/order-upload
 * @requires module:app/form/form~Form
 * @exports UploadOrdersModal
 */
import {createElement, Fragment} from '@bikeshaving/crank/cjs';
import {renderer} from '@bikeshaving/crank/cjs/dom';

import Button from '../lib/button';
import { Fetch }  from '../lib/fetch';
import BarLoader from '../lib/bar-loader';
import Error from '../lib/error';
import TextButton from '../lib/text-button';
import FormModalWrapper from '../wrappers/form-modal';
import Form from '../form';

/**
 * Icon component for link to expand modal
 *
 * @function ShowLink
 * @param {object} opts Options that are passed to {@link module:app/lib/icon-button~IconButton|IconButton}
 * @param {string} opts.name Name as identifier for the action
 * @param {string} opts.title Hover hint and hidden span
 * @param {string} opts.color Icon colour
 * @returns {Element} IconButton
 */
const ShowLink = (opts) => {
  const { name, title, color, showModal } = opts;
  return (
    <nav class="ph3 pv2 pv3-ns tr">
      <TextButton color={color} title={title} action={showModal} name={name} />
    </nav>
  );
};

/**
 * Options object passed to module:app/components/form-modal~FormModalWrapper
 *
 * @member {object} options
 */
const options = {
  id: 'import-orders', // form id
  title: 'Import Orders',
  color: 'gray',
  src: '/api/import-orders',
  ShowLink: ShowLink,
  saveMsg: 'Upload orders ...',
  successMsg: 'Successfully uploaded orders, reloading page.'
};

/**
 * Get the fields, this includes aync fetching of box dates from api
 *
 * @returns {object}
 */
const getUploadFields = async () => {
  console.log('wtf2');
  const { error, json } = await Fetch("api/current-box-dates")
    .then(result => result)
    .catch(e => ({
      error: e, json: null
    }));
  let fields = {};
  if (!error) {
    fields["Orders"] = {
      id: 'orders',
      size: 'third',
      type: 'file',
      datatype: 'file',
      required: true
    };
    fields["Delivery Date"] = {
      id: 'delivered',
      type: 'input-select',
      size: 'third',
      datatype: 'string',
      required: true,
      datalist: json
    };
  }
  return { error, fields };
};


/**
 * Create a modal to import a file, uploading orders from other sources.
 *
 * @generator
 * @yields {Element} A {@link module:app/form/form~Form|Form} and save/cancel buttons.
 * @param {object} props Property object
 * @param {Function} props.doSave - The save action
 * @param {Function} props.closeModal - The cancel and close modal action
 * @param {string} props.title - Form title
 * @param {string} props.formId - The unique form indentifier
 */
async function *UploadOrdersModal(props) {

  let { doSave, closeModal, title, formId } = props;

  for await (const _ of this) { // eslint-disable-line no-unused-vars
    yield <BarLoader />;

    console.log('wtf');
    const { error, fields } = await getUploadFields();

    const getInitialData = () => (
      {
        file: null,
        delivered: ''
      }
    );

    yield (
      <Fragment>
        {error ? (
          <Error msg={error} />
        ) : (
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
        )}
      </Fragment>
    );
  }
};

export default FormModalWrapper(UploadOrdersModal, options);
