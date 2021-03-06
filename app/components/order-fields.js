/**
 * Form fields for
 * * {@link module:app/components/order-add|AddOrderModal}
 * * {@link module:app/components/order-edit|EditOrderModal}
 *
 * @module app/components/order-fields
 * @author Darryl Cousins <darryljcousins@gmail.com>
 */
import { Fetch } from "../lib/fetch";
import { dateStringForInput } from "../helpers";

/**
 * The order form fields keyed by field title string - required by {@link
 * module:app/form/form~Form|Form}. Delivery dates are collected from {@link api/current-box-dates}
 *
 * @function getOrderFields
 * @param {string} delivered The delivery date
 * @returns {object} The form fields keyed by field title string and error (null if no error)
 */
const getOrderFields = async (delivered) => {

  const { error, json } = await Fetch("api/current-box-dates")
    .then(result => result)
    .catch(e => ({
      error: e, json: null
    }));

  if (!json.includes(delivered)) {
    json.unshift(delivered);
  }

  return {
    error,
    fields: {
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
        required: false,
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
        required: false,
      },
      Box: {
        id: "sku",
        type: "text",
        size: "25",
        datatype: "string",
        required: true,
      },
      Source: {
        id: "source",
        type: "text",
        size: "25",
        datatype: "string",
        required: true,
      },
      "Pickup Date": {
        id: "pickup",
        type: "date", // needs to be calendar select
        size: "25",
        datatype: "date",
        required: true,
        min: dateStringForInput(),
        /*
        type: "text",
        size: "25",
        datatype: "string",
        */
      },
      Delivered: {
        id: "delivered",
        type: "date", // needs to be calendar select
        size: "25",
        datatype: "date",
        required: true,
        min: dateStringForInput(),
        /*
        type: "input-select",
        datatype: "string",
        datalist: json,
        */
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
    },
  };
};

export default getOrderFields;
