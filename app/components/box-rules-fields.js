/**
 * Form fields for
 * * {@link module:app/components/box-rules-add
 * * {@link module:app/components/box-rules-form
 *
 * @module app/components/box-rules-fields
 * @author Darryl Cousins <darryljcousins@gmail.com>
 */
import { Fetch } from "../lib/fetch";

/**
 * The box rules fields
 *
 * @function getBoxRulesFields
 * @returns {object} The form fields keyed by field title string and error (null if no error)
 */
const getBoxRulesFields = async ({rule, disabled}) => {

  console.log('get fields, disabled:', disabled);

  const { error, json } = await Fetch("api/current-box-titles")
    .then(result => result)
    .catch(e => ({
      error: e, json: null
    }));

  json.unshift("All boxes");
  return {
    error,
    fields: {
      Note: {
        id: rule ? `${rule._id}-note` : "note",
        type: "textarea",
        size: "100",
        datatype: "string",
        required: false,
        placeholder: "Descriptive note of purpose of rule",
        disabled,
      },
      "Box SKU": {
        id: rule ? `${rule._id}-box` : "box",
        type: "input-select",
        size: "20",
        required: false,
        datatype: "string",
        datalist: json,
        placeholder: "(select box or day)",
        disabled,
      },
      Weekday: {
        id: rule ? `${rule._id}-weekday` : "weekday",
        type: "input-select",
        size: "20",
        required: false,
        datatype: "string",
        datalist: ["All days", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        placeholder: "(select box or day)",
        disabled,
      },
      Value: {
        id: rule ? `${rule._id}-value` : "value",
        type: "text",
        datatype: "string",
        size: "60",
        required: true,
        placeholder: "String of text to be displayed to user",
        disabled,
      },
      Handle: {
        id: rule ? `${rule._id}-handle` : "handle",
        type: "hidden",
        datatype: "string",
      },
      Title: {
        id: rule ? `${rule._id}-title` : "title",
        type: "hidden",
        datatype: "string",
      },
      Tag: {
        id: rule ? `${rule._id}-tag` : "tag",
        type: "hidden",
        datatype: "string",
      },
    },
  };
};

export default getBoxRulesFields;

