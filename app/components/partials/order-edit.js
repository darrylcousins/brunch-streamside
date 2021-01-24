/** @jsx createElement */
import { createElement } from "@bikeshaving/crank/cjs";

import FormModalWrapper from "../wrappers/form-modal";
import UpsertOrderModal from "./order-upsert";
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
  id: "edit-order", // form id
  title: "Edit Order", // titles
  color: "navy", // icon/link color
  src: "/api/edit-order", // where PostFetch sends data to
  ShowLink, // Element, button or link to open modal
  saveMsg: "Updating order ...", // message on saving
  successMsg: "Successfully updated order, reloading page.", // message on success
};

export default FormModalWrapper(UpsertOrderModal, options);
