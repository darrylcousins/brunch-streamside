module.exports = {
  _id: {
    type: "hidden",
    datatype: "integer",
  },
  Title: {
    type: "text",
    size: "third",
    datatype: "string",
    required: true,
  },
  Author: {
    type: "select",
    size: "third",
    required: true,
    datatype: "string",
    datalist: ["Lilly", "Dominique", "Darryl"],
  },
  Tags: {
    type: "multiple",
    size: "third",
    required: true,
    datatype: "array",
    datalist: [
      "Bug",
      "Urgent",
      "Enhancement",
      "WontFix",
      "NiceToHave",
      "Orders",
      "Boxes",
    ],
  },
  Note: {
    type: "textarea",
    size: "two-thirds",
    datatype: "string",
    required: true,
  },
  Completed: {
    type: "checkbox",
    datatype: "string",
    size: "third",
  },
  Created: {
    datatype: "string",
    type: "hidden",
  },
};
