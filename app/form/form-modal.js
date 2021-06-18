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
 * @module app/form/form-modal
 * @requires module:app/lib/fetch~PostFetch
 * @author Darryl Cousins <darryljcousins@gmail.com>
 */
import { createElement, Fragment, Portal } from "@bikeshaving/crank/cjs";

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
    let saveError = null;

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
     * Can be overridden using ShowLink if, say, a button element not used.
     *
     * @function showModalAction
     * @param {event} ev A click event on this element
     * @listens window.click
     */
    const showModalAction = async (ev) => {
      // are we on the right target??
      if (ev.target.closest(`button[name='${id}']`)) {
        showModal();
      };
    };

    this.addEventListener("click", showModalAction);

    /**
     * Hide the modal on escape key
     *
     * @function hideModal
     * @param {object} ev Event emitted
     * @listens window.keyup
     */
    const hideModal = async (ev) => {
      if (ev.key && ev.key === "Escape") {
        closeModal();
      }
    };

    window.document.addEventListener("keyup", hideModal);

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

      console.log(data);
      /*
      console.warn('Posting saved successfully but disabled for development');
      closeModal();
      return;
      */

      const resetFields = () => {
        loading = false;
        saving = false;
        fieldIds.splice(0, fieldIds.length);
        fieldData.splice(0, fieldData.length);
        fieldLength = 0;
      };

      PostFetch({ src, data, headers })
        .then((result) => {
          console.log('Submit result:', JSON.stringify(result, null, 2));
          const { formError, error, json } = result;
          if (error !== null) {
            fetchError = error;
            resetFields();
            this.refresh();
          } else if (formError !== null) {
            saveError = formError;
            resetFields();
            this.refresh();
          } else {
            resetFields();
            success = true;
            this.refresh();
            setTimeout(() => {
              //  window.location.reload();
              this.dispatchEvent(
                new CustomEvent("orders.reload", {
                  bubbles: true,
                })
              );
              this.dispatchEvent(
                new CustomEvent("boxes.reload", {
                  bubbles: true,
                })
              );
              this.dispatchEvent(
                new CustomEvent("todos.reload", {
                  bubbles: true,
                })
              );
              success = false;
              closeModal();
            }, 1000);
          }
        })
        .catch((err) => {
          console.err("ERROR:", err);
          fetchError = err;
          loading = false;
          this.refresh();
        });
    };

    const fieldIds = [];
    const fieldData = [];
    let fieldLength

    this.addEventListener("form.data.feed", (ev) => {
      if (!fieldIds.includes(ev.detail.id)) {
        console.log(ev.detail.id, 'not stored in fieldIds??', fieldIds);
      }
      fieldData.push(ev.detail);
      if (fieldData.length === fieldLength) {
        const finalData = Object.fromEntries(fieldData.map(el => [el.id, el.value]));
        saveData(finalData);
      }
    });

    /**
     * Loop through form elements and request data
     *
     * @function getData
     */
    const getData = () => {
      const form = document.getElementById(id);
      //console.log('collecting data');
      Array.from(form.elements).forEach((el) => {
        // XXX picks up checkbox-multiple - need to filter them out (el.id === el.name) didn't work
        if (el.tagName !== "FIELDSET" && el.tagName !== "BUTTON") {
          //console.log(fieldIds, el.id);
          if (!fieldIds.includes(el.id)) {
            fieldIds.push(el.id);
            //console.log('dispatching collect, not listened to??');
            el.dispatchEvent(
              new CustomEvent("form.data.collect", {
                bubbles: true,
                detail: {id: el.id}
              })
            );
          }
        }
      });
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
      //console.log("Got return event after validation", ev.detail.valid); // should be true
      if (ev.detail.valid === true) {
        fieldLength = ev.detail.length;
        getData();
      }
    };

    // custom event called by form if passes validation
    this.addEventListener(`${id}.valid`, formValid);

    /**
     * Dynamic custom event to emit when requesting form object to validate
     *
     * @event module:app/form/form-modal#validateEvent
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
     * @fires module:app/form/form-modal#validateEvent
     */
    const doSave = () => {
      const form = document.getElementById(id);
      // fire event listener for Form element - which fires the above
      try {
        // custom event - tell form to run validation
        form.dispatchEvent(validateEvent(id));
      } catch (err) {
        console.log(err);
        fetchError = err;
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
    const getName = () => name;

    const main = document.getElementById("main");

    for (props of this) {
      yield (
        <Fragment>
          <ShowLink
            name={getName()}
            color={color}
            title={title}
            showModal={showModal}
          />
          {visible && (
            <Portal root={main}>
              <div
                class="db absolute left-0 w-100 h-100 z-1 bg-black-90 pa4 mt4"
                style={`top: ${Math.round(window.scrollY).toString()}px;`}
              >
                <div class="bg-white pa4 br3 f6 mw8 relative center">
                  <button
                    class="bn outline-0 bg-transparent pa0 no-underline mid-gray dim o-70 absolute top-1 right-1 pointer"
                    name="close"
                    onclick={closeModal}
                    type="button"
                    title="Close modal"
                  >
                    <CloseIcon />
                    <span class="dn">Close modal</span>
                  </button>
                  <div class="tc center">
                    <h2 class="fw4 fg-streamside-maroon">{title}.</h2>
                  </div>
                  {fetchError && <Error msg={fetchError} />}
                  {saveError && <Error msg={saveError} />}
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
            </Portal>
          )}
        </Fragment>
      );
    };
  };
}

export default FormModalWrapper;
