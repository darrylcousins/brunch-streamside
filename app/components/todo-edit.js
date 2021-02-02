/** @jsx createElement */
/**
 * Creates element to render modal form to add a todo. This is a stub
 * component with all the work done by {@link
 * module:app/components/todo-upsert~UpsertTodoModal|UpsertTodoModal} and is
 * identical to {@link
 * module:app/components/todo-add~AddTodoModal|AddTodoModal} with the
 * exception of having a todo passed to be edited.
 *
 * @module app/components/todo-edit
 * @requires module:app/form/form-modal-wrapper~FormModalWrapper
 * @requires module:app/lib/icon-button~IconButton
 * @requires module:app/components/todo-upsert~UpsertTodoModal
 * @exports EditTodoModal
 */
import { createElement } from "@bikeshaving/crank/cjs";

import FormModalWrapper from "../form/form-modal";
import UpsertTodoModal from "./todo-upsert";
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
  id: "edit-todo", // form id
  title: "Edit Todo", // titles
  color: "navy", // icon/link color
  src: "/api/edit-todo", // where PostFetch sends data to
  ShowLink, // Element, button or link to open modal
  saveMsg: "Updating todo ...", // message on saving
  successMsg: "Successfully updated todo, reloading page.", // message on success
};

export default FormModalWrapper(UpsertTodoModal, options);
