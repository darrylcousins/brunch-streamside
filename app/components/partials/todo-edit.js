/** @jsx createElement */
import { createElement, Fragment } from "@bikeshaving/crank/cjs";

import FormModalWrapper from "../wrappers/form-modal";
import UpsertTodoModal from "./todo-upsert";
import { EditIcon } from "../lib/icon";
import IconButton from "../lib/icon-button";

const ShowLink = (opts) => {
  const { name, title, color } = opts;
  return (
    <IconButton color={color} title={title} name={name}>
      <EditIcon />
    </IconButton>
  );
};

// this is all that we need to make a form modal
// edit src is 'api/update-todo
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
