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
import Form from "../form";

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
function* UpsertOrderModal(props) {
  const { doSave, closeModal, title, order, delivered, formId } = props;

  /**
   * Get the next upcoming date for a particular weekday
   *
   * @function findNextWeekday
   * @param {number} day Integer day of week, Monday -> 0
   * @returns {object} Date object
   */
  const findNextWeekday = (day) => {
    // return the date of next Thursday as 14/01/2021 for example
    // Thursday day is 4, Saturday is 6
    const now = new Date();
    now.setDate(now.getDate() + ((day + (7 - now.getDay())) % 7));
    return now;
  };

  /**
   * Get list of possible delivery days for delivery select list on form
   *
   * @function getUpcoming
   * @returns {Array} List of dates as strings including current delivery date
   * and next Thursday and Saturday
   * @todo Should get these dates from upcoming Boxes
   */
  const getUpcoming = () => {
    // TODO change this to collect from upcoming boxes - /api/current-box-dates
    const dates = [4, 6].map((el) => findNextWeekday(el).toDateString());
    dates.unshift(delivered);
    console.log(dates);
    return dates;
  };

  for (const _ of this) { // eslint-disable-line no-unused-vars

    /**
     * The form fields - required by {@link module:app/form/form~Form|Form}.
     *
     * @member {object} fields The form fields keyed by field title string
     */
    const fields = {
      _id: {
        id: "_id",
        type: "hidden",
        datatype: "integer",
      },
      Name: {
        id: "name", // compiled from first and last
        type: "hidden",
        datatype: "string",
      },
      "Order Number": {
        id: "order_number",
        type: "hidden",
        datatype: "string",
      },
      Price: {
        id: "subtotal_price",
        type: "hidden",
        datatype: "string",
      },
      Including: {
        id: "including",
        type: "hidden",
        datatype: "array",
      },
      "First Name": {
        id: "first_name",
        type: "text",
        size: "25",
        datatype: "string",
        required: true,
      },
      "Last Name": {
        id: "last_name",
        type: "text",
        size: "25",
        datatype: "string",
        required: true,
      },
      Telephone: {
        id: "phone",
        type: "text",
        size: "25",
        datatype: "string",
        required: true,
      },
      "Street Address": {
        id: "address1",
        type: "text",
        size: "25",
        datatype: "string",
        required: true,
      },
      Suburb: {
        id: "address2",
        type: "text",
        size: "25",
        datatype: "string",
        required: false,
      },
      City: {
        id: "city",
        type: "text",
        size: "25",
        datatype: "string",
        required: true,
      },
      Postcode: {
        id: "zip",
        type: "text",
        size: "25",
        datatype: "string",
        required: true,
      },
      Email: {
        id: "contact_email",
        type: "text",
        size: "25",
        datatype: "string",
        required: true,
      },
      Box: {
        id: "sku",
        type: "text",
        size: "third",
        datatype: "string",
        required: true,
      },
      Source: {
        id: "source",
        type: "text",
        size: "third",
        datatype: "string",
        required: true,
      },
      Delivered: {
        id: "delivered",
        type: "select",
        size: "third",
        datatype: "string",
        required: true,
        datalist: getUpcoming(), // find upcoming days?
      },
      Extras: {
        id: "addons",
        type: "text",
        size: "100",
        datatype: "array",
        required: false,
      },
      Excluding: {
        id: "removed",
        type: "text",
        size: "100",
        datatype: "array",
        required: false,
      },
      "Delivery Note": {
        id: "note",
        type: "textarea",
        size: "100",
        datatype: "string",
        required: false,
      },
    };

    /**
     * The form fields - required by {@link module:app/form/form~Form|Form}.
     *
     * @function getInitialData
     * @returns {object} The initial data for the form, if an order supplied
     * returns the order else compiles reasonable defaults.
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

export default UpsertOrderModal;
