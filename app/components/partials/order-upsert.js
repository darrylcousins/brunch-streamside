/** @jsx createElement */
/**
 * Creates element to render modal form adding or editing an order.  component
 * with all the work done by {@link module:app/form/form~Form|Form}. Essential
 * options for the form are a dictionary of fields and initialData.
 *
 * @module app/components/order-upsert
 * @requires module:app/form/form~Form
 * @exports UpsertOrderModal
 */
import { createElement, Fragment } from "@bikeshaving/crank/cjs";

import Button from "../lib/button";
import Error from "../lib/error";
import BarLoader from "../lib/bar-loader";
import Form from "../form";
import getOrderFields from "./order-fields";

/**
 * Create a modal to add or edit an order..
 *
 * @generator
 * @yields {Element} A form and save/cancel buttons.
 * @param {object} props Property object
 * @param {Function} props.doSave - The save action
 * @param {Function} props.closeModal - The cancel and close modal action
 * @param {string} props.title - Form title
 * @param {object} props.order - The order (or null if adding) to be edited
 * @param {string} props.delivered - The delivery date as a string
 * @param {string} props.formId - The unique form indentifier
 */
async function* UpsertOrderModal(props) {
  const { doSave, closeModal, title, order, delivered, formId } = props;

  for await (const _ of this) { // eslint-disable-line no-unused-vars
    yield <BarLoader />;

    /**
     * The order form fields keyed by field title string - required by {@link
     * module:app/form/form~Form|Form}. The `delivered` field depends on list
     * of upcoming box dates fetched from api and therefore is asynchronous and
     * handles error. See {@link
     * module:app/components/order-fields~getOrderFields|getOrderFields} for
     * clarification.
     *
     * @member {object} fields
     */
    /**
     * Error if fetching box delivery dates fails
     *
     * @member {object|string} error
     */
    const { error, fields } = await getOrderFields(delivered);

    /**
     * The initial form data - required by {@link
     * module:app/form/form~Form|Form}.  If an order supplied returns the order
     * else compiles reasonable defaults.
     *
     * @function getInitialData
     * @returns {object} The initial form data
     */
    const getInitialData = () => {
      if (typeof order !== "undefined") {
        return order;
      }
      const result = Object();
      for (const value of Object.values(fields)) {
        result[value.id] = "";
      }
      result.delivered = delivered;
      result._id = new Date().getTime();
      return result;
    };

    yield (
      <Fragment>
        {error ? (
          <Error msg={error} />
        ) : (
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
        )}
      </Fragment>
    );
  }
}

export default UpsertOrderModal;
