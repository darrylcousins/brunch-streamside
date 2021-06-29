/** @jsx createElement */
/**
 * Creates element to render modal form to add a subscriber. This is a stub
 * component with all the work done by {@link
 * module:app/components/subscriber-upsert~UpsertSubscriberModal|UpsertSubscriberModal} and is
 * identical to {@link
 * module:app/components/subscriber-edit~EditSubscriberModal|EditSubscriberModal} with the
 * exception of not having an subscriber passed to be edited.
 *
 * @module app/components/subscriber-add
 * @requires module:app/form/form-modal-wrapper~FormModalWrapper
 * @requires module:app/lib/text-button~TextButton
 * @requires module:app/components/subscriber-upsert~UpsertSubscriberModal
 * @exports AddSubscriberModal
 * @author Darryl Cousins <darryljcousins@gmail.com>
 */
import { createElement } from "@bikeshaving/crank/cjs";

import FormModalWrapper from "../form/form-modal";
import UpsertSubscriberModal from "./subscriber-upsert";
import IconButton from "../lib/icon-button";
import { AddIcon } from "../lib/icon";

/**
 * Text button for link to expand modal
 *
 * @function ShowLink
 * @param {object} opts Options that are passed to {@link module:app/lib/text-button~TextButton|TextButton}
 * @param {string} opts.name Name as identifier for the action
 * @param {string} opts.title Hover hint
 * @param {string} opts.color Text colour
 * @param {Function} opts.showModal Action to display modal
 * @returns {Element} A button
 */
const ShowLink = (opts) => {
  const { name, title, color, showModal } = opts;
  return (
    <IconButton color={color} title={title} name={name}>
      <AddIcon />
    </IconButton>
  );
};

/**
 * Options object passed to module:app/components/form-modal~FormModalWrapper
 *
 * @member {object} options
 */
const options = {
  id: "add-subscriber", // form id
  title: "Add Subscriber", // titles
  color: "navy", // icon/link color
  src: "/api/add-subscriber", // where PostFetch sends data to
  ShowLink, // Element, button or link to open modal
  saveMsg: "Updating subscriber ...", // message on saving
  successMsg: "Successfully added subscriber, reloading page.", // message on success
};

export default FormModalWrapper(UpsertSubscriberModal, options);

