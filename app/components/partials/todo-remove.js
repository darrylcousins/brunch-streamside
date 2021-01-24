/** @jsx createElement */
import { createElement, Fragment } from "@bikeshaving/crank/cjs";
import { renderer } from "@bikeshaving/crank/cjs/dom";

import { RemoveIcon } from "../lib/icon";
import Button from "../lib/button";
import IconButton from "../lib/icon-button";
import FormModalWrapper from "../wrappers/form-modal";
import Form from "../form";

const ShowLink = (opts) => {
  const { name, title, color } = opts;
  return (
    <IconButton color={color} title={title} name={name}>
      <RemoveIcon />
    </IconButton>
  );
};

const options = {
  id: "remove-todo", // form id
  title: "Remove Todo",
  color: "dark-red",
  src: "/api/remove-todo",
  ShowLink,
  saveMsg: "Removing todo ...",
  successMsg: "Successfully removed todo, reloading page.",
};

function* RemoveTodoModal(props) {
  const { doSave, closeModal, title, todo, formId } = props;

  for (const _ of this) {
    const fields = {
      _id: {
        type: "hidden",
        datatype: "integer",
      },
    };

    const getInitialData = () => ({ _id: todo._id });

    yield (
      <Fragment>
        <p class="lh-copy tl">
          Are you sure you want to remove 
          {' '}
          <b>{todo.title}</b>
          ?
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

module.exports = FormModalWrapper(RemoveTodoModal, options);
