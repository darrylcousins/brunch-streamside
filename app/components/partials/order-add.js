/** @jsx createElement */
import { createElement } from "@bikeshaving/crank/cjs";

import { AddIcon } from "../lib/icon";
import FormModalWrapper from "../wrappers/form-modal";
import UpsertOrderModal from "./order-upsert";
import IconButton from "../lib/icon-button";

/* TODO
 * check date list in order-upsert to collect from upcoming boxes - /api/current-box-dates
 * make box a list to collect from available boxes for selected date - /api/current-boxes
 */

const ShowLink = (opts) => {
  const { name, title, color } = opts;
  return (
    <IconButton color={color} title={title} name={name}>
      <AddIcon />
    </IconButton>
  );
};

const options = {
  id: "add-order", // form id
  title: "Add Order",
  color: "navy",
  src: "/api/add-order",
  ShowLink,
  saveMsg: "Saving order ...",
  successMsg: "Successfully saved order, reloading page.",
};

module.exports = FormModalWrapper(UpsertOrderModal, options);
