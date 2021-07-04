/** @jsx createElement */
/**
 * Creates element to render modal form to add a subscriber. This is a stub
 * component with all the work done by {@link
 * module:app/components/subscriber-upsert~UpsertSubscriberModal|UpsertSubscriberModal} and is
 * identical to {@link
 * module:app/components/subscriber-add~AddSubscriberModal|AddSubscriberModal} with the
 * exception of having a subscriber passed to be edited.
 *
 * @module app/components/subscriber-edit
 * @requires module:app/form/form-modal-wrapper~FormModalWrapper
 * @requires module:app/lib/icon-button~IconButton
 * @requires module:app/components/subscriber-upsert~UpsertSubscriberModal
 * @exports EditSubscriberModal
 * @author Darryl Cousins <darryljcousins@gmail.com>
 */
import { createElement } from "@bikeshaving/crank/cjs";

import FormModalWrapper from "../form/form-modal";
import UpsertSubscriberModal from "./subscriber-upsert";
import { EditIcon } from "../lib/icon";
import IconButton from "../lib/icon-button";

/**
 * Icon button for link to expand modal
 *
 * @function ShowLink
 * @param {object} opts Options that are passed to {@link module:app/lib/icon-button~IconButton|IconButton}
 * @param {string} opts.name Name as identifier for the action
 * @param {string} opts.title Hover hint
 * @param {string} opts.color Icon colour
 * @returns {Element} An icon button
 */
const ShowLink = (opts) => {
  const { name, title, color } = opts;
  return (
    <IconButton color={color} title={title} name={name}>
      <EditIcon />
    </IconButton>
  );
};

/**
 * Options object passed to module:app/components/form-modal~FormModalWrapper
 *
 * @member {object} options
 */
const options = {
  id: "edit-subscriber", // form id
  title: "Edit Subscriber", // titles
  color: "navy", // icon/link color
  src: "/api/edit-subscriber", // where PostFetch sends data to
  ShowLink, // Element, button or link to open modal
  saveMsg: "Updating subscriber ...", // message on saving
  successMsg: "Successfully updated subscriber, reloading page.", // message on success
};

export default FormModalWrapper(UpsertSubscriberModal, options);
