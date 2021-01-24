/** @jsx createElement */
import { createElement, Fragment } from "@bikeshaving/crank/cjs";

import FormModalWrapper from "../wrappers/form-modal";
import UpsertTodoModal from "./todo-upsert";
import TextButton from "../lib/text-button";

const ShowLink = (opts) => {
  const { name, title, color, showModal } = opts;
  return (
    <nav class="ph3 pv2 pv3-ns tr">
      <TextButton color={color} title={title} action={showModal} name={name} />
    </nav>
  );
};

// this is all that we need to make a form modal
// edit src is 'api/update-todo
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
