/** @jsx createElement */
/**
 * Creates element to render a modal form for adding or editing a subscriber. This
 * component sets up the form fields and initial data to render a {@link
 * module:app/form/form~Form|Form}. Essential options for the form are a
 * dictionary of fields and initialData.
 *
 * @module app/components/subscriber-upsert
 * @requires module:app/form/form~Form
 * @exports UpsertSubscriberModal
 * @author Darryl Cousins <darryljcousins@gmail.com>
 */
import { createElement, Fragment } from "@bikeshaving/crank/cjs";

import Button from "../lib/button";
import Form from "../form";

/**
 * Create a modal to add or edit a subscriber
 *
 * @generator
 * @yields {Element} A {@link module:app/form/form~Form|Form} and save/cancel buttons.
 * @param {object} props Property object
 * @param {Function} props.doSave - The save action
 * @param {Function} props.closeModal - The cancel and close modal action
 * @param {string} props.title - Form title
 * @param {object} props.subscriber - The subscriber (or null if adding) to be edited
 * @param {string} props.formId - The unique form indentifier
 */
function* UpsertSubscriberModal(props) {
  const { doSave, closeModal, title, subscriber, formId } = props;

  const fields = {
    _id: {
      type: "hidden",
      datatype: "string",
    },
    Name: {
      type: "text",
      size: "100",
      datatype: "string",
      required: true,
    },
  };
  /**
   * The initial form data - required by {@link
   * module:app/form/form~Form|Form}.  If a subscriber is supplied return the subscriber
   * else compiles reasonable defaults.
   *
   * @function getInitialData
   * @returns {object} The initial form data
   */
  const getInitialData = () => {
    if (typeof subscriber !== "undefined") {
      return subscriber;
    }
    const now = new Date();
    return {
      _id: null,
      name: null,
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

export default UpsertSubscriberModal;

