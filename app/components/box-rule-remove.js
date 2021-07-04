/** @jsx createElement */
/**
 * Creates element to render modal form to remove a single box.
 *
 * @module app/components/box-remove
 * @requires module:app/form/form-modal-wrapper~FormModalWrapper
 * @requires module:app/lib/icon-button~IconButton
 * @exports RemoveBoxModal
 * @author Darryl Cousins <darryljcousins@gmail.com>
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
  id: "remove-box-rule", // form id
  title: "Remove Box Rule",
  color: "dark-red",
  src: "/api/remove-setting", // box rules are just special settings
  ShowLink,
  saveMsg: "Removing box rule...",
  successMsg: "Successfully removed box rule, reloading page.",
  portal: "front-modal-window", // default portal is 'modal-window' - this puts it front
};

/**
 * Create a modal to remove an box.
 *
 * @generator
 * @yields {Element} A form and remove/cancel buttons.
 * @param {object} props Property object
 * @param {Function} props.doSave - The save action
 * @param {Function} props.closeModal - The cancel and close modal action
 * @param {string} props.title - Form title
 * @param {object} props.box - The box to be removed
 * @param {string} props.formId - The unique form indentifier
 */
function* RemoveBoxRule(props) {
  const { doSave, closeModal, title, rule, formId } = props;

  /**
   * The form fields - required by {@link module:app/form/form~Form|Form}.
   *
   * @member {object} fields The form fields keyed by field title string
   */
  const fields = {
    _id: {
      type: "hidden",
      datatype: "string",
    },
  };

  /**
   * The initial data of the form
   *
   * @function getInitialData
   * @returns {object} The initial data for the form
   * returns the box else compiles reasonable defaults.
   */
  const getInitialData = () => ({
    _id: rule._id
  });

  while (true) {
    yield (
      <Fragment>
        <p class="lh-copy tl">
          Are you sure you want to remove
          <b class="ph1">{rule.note}</b>
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
 * @member {object} RemoveBoxModal
 */
export default FormModalWrapper(RemoveBoxRule, options);


