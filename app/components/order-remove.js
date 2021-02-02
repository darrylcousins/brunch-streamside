/** @jsx createElement */
/**
 * Creates element to render modal form to remove a single order.
 *
 * @module app/components/order-remove
 * @requires module:app/form/form-modal-wrapper~FormModalWrapper
 * @requires module:app/lib/icon-button~IconButton
 * @exports RemoveOrderModal
 */
import { createElement, Fragment } from "@bikeshaving/crank/cjs";
import { DeleteIcon } from "../lib/icon";
import Button from "../lib/button";
import IconButton from "../lib/icon-button";
import FormModalWrapper from "../form/form-modal";
import Form from "../form";

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
  const { name, title, color } = opts;
  return (
    <IconButton color={color} title={title} name={name}>
      <DeleteIcon />
    </IconButton>
  );
};

/**
 * Options object passed to module:app/components/form-modal~FormModalWrapper
 *
 * @member {object} options
 */
const options = {
  id: "remove-order", // form id
  title: "Remove Order",
  color: "dark-red",
  src: "/api/remove-order",
  ShowLink,
  saveMsg: "Removing order ...",
  successMsg: "Successfully removed order, reloading page.",
};

/**
 * Create a modal to remove an order.
 *
 * @generator
 * @yields {Element} A form and remove/cancel buttons.
 * @param {object} props Property object
 * @param {Function} props.doSave - The save action
 * @param {Function} props.closeModal - The cancel and close modal action
 * @param {string} props.title - Form title
 * @param {object} props.order - The order to be removed
 * @param {string} props.formId - The unique form indentifier
 */
function* RemoveOrder(props) {
  const { doSave, closeModal, title, order, formId } = props;

  /**
   * The form fields - required by {@link module:app/form/form~Form|Form}.
   *
   * @member {object} fields The form fields keyed by field title string
   */
  const fields = {
    _id: {
      type: "hidden",
      datatype: "integer",
    },
  };

  /**
   * The initial data of the form
   *
   * @function getInitialData
   * @returns {object} The initial data for the form
   * returns the order else compiles reasonable defaults.
   */
  const getInitialData = () => ({ _id: order._id });

  while (true) {
    yield (
      <Fragment>
        <p class="lh-copy tl">
          Are you sure you want to remove
          <b class="ph1">{order.sku}</b>
          for
          <b class="ph1">{order.contact_email}</b>
          from
          <b class="ph1">{order.source}</b>?
        </p>
        <Form
          data={getInitialData()}
          fields={fields}
          title={title}
          id={formId}
        />
        <div class="w-90 center ph1">
          <Button type="primary" onclick={doSave}>
            Remove
          </Button>
          <Button type="secondary" onclick={closeModal}>
            Cancel
          </Button>
        </div>
      </Fragment>
    );
  }
}

/**
 * Wrapped component
 *
 * @member {object} RemoveOrderModal
 */
const RemoveOrderModal = FormModalWrapper(RemoveOrder, options);
export default RemoveOrderModal;
