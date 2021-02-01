/** @jsx createElement */
/**
 * FormModalWrapper pull in common functionality shared between action that call up a modal and display a form. It used by
 * * {@link module:app/components/order-add|AddOrderModal}
 * * {@link module:app/components/order-edit|EditOrderModal}
 * * {@link module:app/components/order-remove|RemoveOrderModal}
 * * {@link module:app/components/box-add|AddBoxModal}
 * * {@link module:app/components/box-edit|EditBoxModal}
 * * {@link module:app/components/box-remove|RemoveBoxModal}
 * * {@link module:app/components/todo-add|AddTodoModal}
 * * {@link module:app/components/todo-edit|EditTodoModal}
 * * {@link module:app/components/todo-remove|RemoveTodoModal}
 *
 * @module app/form/form-modal-wrapper
 * @requires module:app/lib/fetch~PostFetch
 */
import { createElement, Fragment } from "@bikeshaving/crank/cjs";

import BarLoader from "../lib/bar-loader";
import Error from "../lib/error";
import { PostFetch } from "../lib/fetch";
import { CloseIcon } from "../lib/icon";

/**
 * Wrap a crank Component and provide modal and form functionality
 *
 * @function FormModalWrapper
 * @returns {Function} Return the wrapped component
 * @param {object} Component The component to be wrapped
 * @param {object} options Options for form and modal
 */
function FormModalWrapper(Component, options) {
  /**
   * Wrap a crank Component and provide modal and form functionality
   *
   * @function Wrapper
   * @yields {Element} Return the wrapped component
   * @param {object} props Property object
   */
  return function* (props) {
    const { id, title, src, ShowLink, color, saveMsg, successMsg } = options;
    const name = title.toLowerCase().replace(/ /g, "-");
    let visible = false;
    let loading = false;
    let success = false;
    let saving = false;
    let fetchError = null;
    let formError = null;

    /**
     * Action which closes the modal and refreshes component. Normally attached
     * to the modal `close` button and the `cancel` button.
     *
     * @function closeModal
     */
    const closeModal = () => {
      visible = false;
      this.refresh();
    };

    /**
     * Action which opens the modal and refreshes component
     *
     * @function showModal
     */
    const showModal = () => {
      visible = true;
      this.refresh();
    };

    /**
     * Action which opens the modal and refreshes component, checks target for
     * closest button to ensure that event is this.event. Fired on `this.click`.
     *
     * @function showModalAction
     * @param {event} ev A click event on this element
     * @listens window.click
     */
    const showModalAction = async (ev) => {
      // are we on the right target??
      if (ev.target.closest(`button[name='${id}']`)) {
        showModal();
      }
    };

    this.addEventListener("click", showModalAction);

    /**
     * Read data from the form and send to the api for saving
     *
     * @function saveData
     * @param {object} form The form data.
     */
    const saveData = (form) => {
      loading = true;
      saving = true;
      this.refresh();

      let hasFile = false;
      let data;
      let headers = { "Content-Type": "application/json" };

      // check to find if we have a file upload
      Object.values(form).some((value) => {
        if (typeof value.name === "string") {
          console.log("GOT FILE", value);
          hasFile = true;
          return true;
        }
        return false;
      });

      // we have a file so need to use FormData and not json encode data
      // see PostFetch
      if (hasFile) {
        data = new FormData();
        Object.entries(form).forEach(([key, value]) => {
          data.set(key, value);
        });
        headers = {};
      } else {
        // no file - use json encoding
        data = form;
      }

      console.log(headers, data);

      PostFetch({ src, data, headers })
        .then((result) => {
          const { error, json } = result;
          if (error !== null) {
            fetchError = error;
            console.log("Fetch:", fetchError);
            loading = false;
            saving = false;
            this.refresh();
          } else {
            console.log(JSON.stringify(json));
            loading = false;
            saving = false;
            success = true;
            this.refresh();
            setTimeout(() => {
              window.location.reload();
            }, 2000);
          }
        })
        .catch((err) => {
          console.log("ERROR:", err);
          fetchError = err;
          loading = false;
          this.refresh();
        });
    };

    /**
     * Read data from the form and send to the api for saving
     *
     * @function getData
     * @returns {object} The form data collected
     */
    const getData = () => {
      const form = document.getElementById(id);
      // get them all and use data-type to sort for type
      const data = {};
      Array.from(form.elements).forEach((el) => {
        if (el.tagName !== "FIELDSET" && el.tagName !== "BUTTON") {
          let value;
          //console.log(el);
          el.dispatchEvent(
            new CustomEvent("getdata", {
              bubbles: true
            })
          );
          if (el.type === "checkbox") {
            value = el.checked;
          } else if (el.type === "file") {
            [value] = el.files;
          } else {
            value = el.value;
          }
          if (el.getAttribute("datatype") === "integer") {
            value = parseInt(value, 10);
          }
          if (el.getAttribute("datatype") === "array") {
            value = value.split(",").filter((item) => item !== "");
          }
          data[el.id] = value;
        }
      });
      return data;
    };

    /**
     * Called on custom event by the form if it passes validation. Calls
     * saveData with getData().
     *
     * @function formValid
     * @param {event} ev Custom event
     * @listens module:app/form/form#validationEvent
     */
    const formValid = async (ev) => {
      // console.log("Got return event after validation", ev.detail.valid); // should be true
      if (ev.detail.valid === true) {
        saveData(getData());
      }
    };

    // custom event called by form if passes validation
    this.addEventListener(`${id}.valid`, formValid);

    /**
     * Dynamic custom event to emit when requesting form object to validate
     *
     * @event module:app/form/form-modal-wrapper#validateEvent
     * @param {string} formId The form id
     */
    const validateEvent = (formId) => new CustomEvent(`${formId}.validate`, {
      bubbles: true,
    });

    /**
     * The action attached to the `save` button. Locates the form in the DOM
     * and sends it a custom event to validate. If the form validates it in
     * turns fires the ${id}.valid event to which `formValid` is listening for.
     *
     * @function doSave
     * @fires module:app/form/form-modal-wrapper#validateEvent
     */
    const doSave = () => {
      const form = document.getElementById(id);
      // fire event listener for Form element - which fires the above
      try {
        // custom event - tell form to run validation
        form.dispatchEvent(validateEvent(id));
      } catch (err) {
        console.log(err);
        formError = err;
        this.refresh();
      }
    };

    /**
     * Bit of a hack to give a button a particular name to use as identifier,
     * e.g. using props.delivered
     *
     * @function getName
     * @returns {string} An identifying name for the button
     */
    const getName = () => {
      return name;
    };

    while (true)
      yield (
        <Fragment>
          <ShowLink
            name={getName()}
            color={color}
            title={title}
            showModal={showModal}
          />
          {visible && (
            <div
              class="db absolute left-0 w-100 h-100 z-1 bg-black-90 pa4"
              style={`top: ${Math.round(window.scrollY).toString()}px;`}
            >
              <div class="bg-white pa4 br3">
                <button
                  class="bn outline-0 bg-transparent pa0 no-underline mid-gray dim o-70 absolute top-1 right-1"
                  name="close"
                  onclick={closeModal}
                  type="button"
                  style="margin-right: 30px; margin-top: 30px;"
                  title="Close modal"
                >
                  <CloseIcon />
                  <span class="dn">Close modal</span>
                </button>
                <div class="tc center">
                  <h2 class="fw4 fg-streamside-maroon">{title}.</h2>
                </div>
                {fetchError && <Error msg={fetchError} />}
                {formError && <Error msg={formError} />}
                {saving && (
                  <div class="mv2 pt2 pl2 navy br3 ba b--navy bg-washed-blue">
                    <p class="tc">{saveMsg}</p>
                  </div>
                )}
                {success && (
                  <div class="mv2 pt2 pl2 br3 dark-green ba b--dark-green bg-washed-green">
                    <p class="tc">{successMsg}</p>
                  </div>
                )}
                {loading && <BarLoader />}
                {!loading && !success && !fetchError && (
                  <Component
                    {...props}
                    title={title}
                    formId={id}
                    doSave={doSave}
                    closeModal={closeModal}
                  />
                )}
              </div>
            </div>
          )}
        </Fragment>
      );
  };
}

export default FormModalWrapper;
