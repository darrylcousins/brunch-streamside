/** @jsx createElement */
/**
 * Creates element to render modal form to add a todo. This is a stub
 * component with all the work done by {@link
 * module:app/components/todo-upsert~UpsertTodoModal|UpsertTodoModal} and is
 * identical to {@link
 * module:app/components/todo-edit~EditTodoModal|EditTodoModal} with the
 * exception of not having an todo passed to be edited.
 *
 * @module app/components/todo-add
 * @requires module:app/form/form-modal-wrapper~FormModalWrapper
 * @requires module:app/lib/text-button~TextButton
 * @requires module:app/components/todo-upsert~UpsertTodoModal
 * @exports AddTodoModal
 */
import { createElement } from "@bikeshaving/crank/cjs";

import FormModalWrapper from "../wrappers/form-modal";
import UpsertTodoModal from "./todo-upsert";
import TextButton from "../lib/text-button";

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
  id: "add-todo", // form id
  title: "Add Todo", // titles
  color: "gray", // icon/link color
  src: "/api/add-todo", // where PostFetch sends data to
  ShowLink, // Element, button or link to open modal
  saveMsg: "Updating todo ...", // message on saving
  successMsg: "Successfully updated todo, reloading page.", // message on success
};

export default FormModalWrapper(UpsertTodoModal, options);
