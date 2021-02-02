/** @jsx createElement */
/**
 * Creates element to render a modal form for adding or editing a todo. This
 * component sets up the form fields and initial data to render a {@link
 * module:app/form/form~Form|Form}. Essential options for the form are a
 * dictionary of fields and initialData.
 *
 * @module app/components/todo-upsert
 * @requires module:app/form/form~Form
 * @exports UpsertTodoModal
 */
import { createElement, Fragment } from "@bikeshaving/crank/cjs";

import Button from "../lib/button";
import Form from "../form";
import fields from "./todo-fields";

/**
 * Create a modal to add or edit a todo
 *
 * @generator
 * @yields {Element} A {@link module:app/form/form~Form|Form} and save/cancel buttons.
 * @param {object} props Property object
 * @param {Function} props.doSave - The save action
 * @param {Function} props.closeModal - The cancel and close modal action
 * @param {string} props.title - Form title
 * @param {object} props.todo - The todo (or null if adding) to be edited
 * @param {string} props.formId - The unique form indentifier
 */
function* UpsertTodoModal(props) {
  const { doSave, closeModal, title, todo, formId } = props;

  /**
   * The initial form data - required by {@link
   * module:app/form/form~Form|Form}.  If a todo is supplied return the todo
   * else compiles reasonable defaults.
   *
   * @function getInitialData
   * @returns {object} The initial form data
   */
  const getInitialData = () => {
    if (typeof todo !== "undefined") {
      return todo;
    }
    const now = new Date();
    return {
      _id: now.getTime(),
      title: "",
      tags: "",
      note: "",
      author: "",
      created: now.toDateString(),
      completed: false,
    };
  };

  while (true) {
    yield (
      <Fragment>
        <div class="w-90 center ph1">
          <Form
            data={getInitialData()}
            fields={fields}
            title={title}
            id={formId}
          />
          <Button type="primary" onclick={doSave}>
            Save
          </Button>
          <Button type="secondary" onclick={closeModal}>
            Cancel
          </Button>
        </div>
      </Fragment>
    );
  }
}

export default UpsertTodoModal;
