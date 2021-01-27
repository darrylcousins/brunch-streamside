/** @jsx createElement */
import { createElement, Fragment } from "@bikeshaving/crank/cjs";
import { DeleteIcon } from "../lib/icon";
import Button from "../lib/button";
import IconButton from "../lib/icon-button";
import FormModalWrapper from "../wrappers/form-modal";
import Form from "../form";

const ShowLink = (opts) => {
  const { name, title, color } = opts;
  return (
    <IconButton color={color} title={title} name={name}>
      <DeleteIcon />
    </IconButton>
  );
};

const options = {
  id: "remove-order", // form id
  title: "Remove Order",
  color: "dark-red",
  src: "/api/remove-order",
  ShowLink,
  saveMsg: "Removing order ...",
  successMsg: "Successfully removed order, reloading page.",
};

function* RemoveOrderModal(props) {
  const { doSave, closeModal, title, order, formId } = props;

  const fields = {
    _id: {
      type: "hidden",
      datatype: "integer",
    },
  };

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

export default FormModalWrapper(RemoveOrderModal, options);
