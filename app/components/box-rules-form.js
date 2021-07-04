/** @jsx createElement */
/**
 * Creates element to render add box rule form - used by box-settings and
 * wrapped in CollapseWrapper
 *
 * @module app/components/box-rules-add
 * @exports BoxRulesModal
 * @author Darryl Cousins <darryljcousins@gmail.com>
 */
import { createElement, Fragment, Portal} from "@bikeshaving/crank/cjs";
import { CloseIcon } from "../lib/icon";
import { Fetch, PostFetch } from "../lib/fetch";
import { animateFadeForAction, animateFade } from "../helpers";
import Form from "../form";
import Button from "../lib/button";
import BarLoader from "../lib/bar-loader";
import Error from "../lib/error";
import IconButton from "../lib/icon-button";
import CollapseWrapper from "./collapse-animator";
import getBoxRulesFields from "./box-rules-fields";

/**
 * The add rule form wrapped in collapse-wrapper
 * @generator
 * @yields {Element} DOM element displaying modal
 * @param {object} props Property object
 */
function *RulesForm({ rule, disabled, toggleCollapse }) {

  /**
   * Hold loading state.
   *
   * @member {boolean} loading
   */
  let loading = true;
  /**
   * The form boxRulesFields fetched
   *
   * @member {object} fields
   */
  let boxRulesFields = null;
  /**
   * Hold error state.
   *
   * @member {boolean} formError
   */
  let formError = false;

  /**
   * The form id
   *
   * @member {string} id
   */
  const id = rule ? `${rule._id}-box-rules-form` :"box-rules-form";

  /**
   * Called on custom event by the form if it passes validation. Calls
   * saveData with getData().
   *
   * @function formValid
   * @param {event} ev Custom event
   */
  const submitForm = async () => {
    const form = document.getElementById(id);
    const ids = Object.entries(boxRulesFields).map(([key, value]) => value.id);

    const data = {};

    // populate data from form
    ids.map(id => data[id] = form.elements[id].value);

    let src;
    if (rule) {
      let key
      src = "api/edit-setting";
      const l = rule._id.length + 1;
      Object.keys(data).map(el => {
        data[el.slice(l)] = data[el];
        delete data[el];
      });
      data._id = rule._id;
    } else {
      src = "api/add-setting";
    }


    let headers = { "Content-Type": "application/json" };
    PostFetch({ src, data, headers })
      .then((result) => {
        const { error, json } = result;
        if (error !== null) {
          formError = error;
          loading = false;
          this.refresh();
        } else {
          this.refresh();
          toggleCollapse();
          setTimeout(() => {
            this.dispatchEvent(
              new CustomEvent("listing.reload", {
                bubbles: true,
              })
            );
          }, 2000);
        }
      })
      .catch((err) => {
        loading = false;
        formError = err;
        this.refresh();
      });
  };

  const formValid = async (ev) => {
    if (ev.detail.valid === true) {
      if (document.getElementById("box-rules-table")) {
        animateFade("box-rules-table", 0.4);
      };
      submitForm();
    } else {
      setTimeout(() => {
        this.dispatchEvent(
          new CustomEvent("collapse.wrapper.resize", {
            bubbles: true,
          })
        );
      }, 100);
    };
  };

  // custom event called by form if passes validation
  this.addEventListener(`${id}.valid`, formValid);

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
      form.dispatchEvent(
        new CustomEvent(`${id}.validate`, {
          bubbles: true,
        })
      );
    } catch (err) {
      formError = err;
      this.refresh();
    }
  };

  /**
   * Get initial default data
   *
   * @member {object} initialData
   */
  const getInitialData = (rule) => {
    if (rule) {
      const data = {};
      let value;
      Object.keys(rule).map(key => {
        value = rule[key]; 
        if (key === "box" && !rule.box) value = "All boxes";
        if (key === "weekday" && !rule.weekday) value = "All days";
        data[`${rule._id}-${key}`] = value;
      });
      return data;
    } else {
      return {
        // default values
        handle: "box-rule",
        title: "Box Rule",
        tag: "Boxes",
      };
    };
  };

  const getFields = (currentDisabled) => {
    getBoxRulesFields({rule, disabled: currentDisabled}).then(({error, fields}) => {
      if (error) {
        formError = error;
        loading = false;
        this.refresh();
      } else {
        boxRulesFields = fields;
        loading = false;
        this.refresh();
      }
    });
  };

  getFields(disabled);

  for (const {rule: newRule, disabled: newDisabled} of this) {
    if (disabled !== newDisabled) getFields(newDisabled);
    yield (
      <Fragment>
        <div class={`w-100 center ph1 ${!newRule && "ba b--black-40 br2"}`}>
          {!Boolean(newRule) && (
            <h3 class="tc">Add Box Rule</h3>
          )}
          {loading && <BarLoader />}
          {formError && <Error msg={formError} />}
          {!formError && !loading && (
            <Fragment>
              <Form
                data={getInitialData(newRule)}
                fields={boxRulesFields}
                title="Add box rule"
                id={id}
                hideLabel={Boolean(newRule)}
              />
              {!newDisabled && (
                <div class="mb2 mr2 mr2 tr">
                  <Button type="primary" onclick={doSave}>
                    Save
                  </Button>
                  <Button type="secondary" onclick={toggleCollapse}>
                    Cancel
                  </Button>
                </div>
              )}
            </Fragment>
          )}
        </div>
      </Fragment>
    )
    disabled = newDisabled;
  };
};

export default RulesForm;
